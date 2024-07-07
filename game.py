import pygame
import random
import math
import sys

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 900
SCREEN_HEIGHT = 900
BACKGROUND_COLOR = (0, 0, 0)
PLANE_COLOR = (255, 255, 255)
CIRCLE_COLOR = (255, 165, 0)
PLANE_SIZE = (20, 26)
CIRCLE_SIZE = 4
NUM_CIRCLES = 60
CIRCLE_RADIUS = 600  # Starting distance from the center of the screen
SPEED_MIN = 3  # Pixels per frame
SPEED_MAX = 4.5
START_POSITION_RANGE = 100  # Random offset from the starting position
FONT_COLOR = (255, 255, 255)
SCORE_MULTIPLIER = 100

# Screen setup
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Plane Dodge Game")

# Font setup
font = pygame.font.Font(None, 36)

# Plane class
class Plane(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface(PLANE_SIZE, pygame.SRCALPHA)
        self.rect = self.image.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        self.speed = 5
        self.direction = "up"
        self.draw_plane()

    def draw_plane(self):
        self.image.fill((0, 0, 0, 0))  # Clear the image
        if self.direction == "left":
            points = [(5, PLANE_SIZE[1]), (PLANE_SIZE[0] // 2, 0), (PLANE_SIZE[0] - 5, PLANE_SIZE[1])]
        elif self.direction == "right":
            points = [(5, PLANE_SIZE[1]), (PLANE_SIZE[0] // 2, 0), (PLANE_SIZE[0] - 5, PLANE_SIZE[1])]
        else:  # default "up"
            points = [(0, PLANE_SIZE[1]), (PLANE_SIZE[0] // 2, 0), (PLANE_SIZE[0], PLANE_SIZE[1])]
        
        pygame.draw.polygon(self.image, PLANE_COLOR, points)
        pygame.draw.line(self.image, (0, 0, 0), (PLANE_SIZE[0] // 2, 0), (PLANE_SIZE[0] // 2, PLANE_SIZE[1]), 2)

    def update(self, keys):
        if keys[pygame.K_LEFT]:
            self.rect.x -= self.speed
            self.direction = "left"
        elif keys[pygame.K_RIGHT]:
            self.rect.x += self.speed
            self.direction = "right"
        else:
            self.direction = "up"
        
        if keys[pygame.K_UP]:
            self.rect.y -= self.speed
        if keys[pygame.K_DOWN]:
            self.rect.y += self.speed

        # Keep the plane within the screen
        self.rect.clamp_ip(screen.get_rect())
        self.draw_plane()

# Circle class
class Circle(pygame.sprite.Sprite):
    def __init__(self, position, direction):
        super().__init__()
        self.image = pygame.Surface((CIRCLE_SIZE * 2, CIRCLE_SIZE * 2), pygame.SRCALPHA)
        pygame.draw.circle(self.image, CIRCLE_COLOR, (CIRCLE_SIZE, CIRCLE_SIZE), CIRCLE_SIZE)
        self.rect = self.image.get_rect(center=position)
        self.speed = random.randint(int(SPEED_MIN * 100), int(SPEED_MAX * 100)) / 100
        self.direction = direction

    def update(self):
        self.rect.x += self.speed * self.direction[0]
        self.rect.y += self.speed * self.direction[1]

        # Wrap around the screen
        if self.rect.right < 0:
            self.rect.left = SCREEN_WIDTH
        if self.rect.left > SCREEN_WIDTH:
            self.rect.right = 0
        if self.rect.bottom < 0:
            self.rect.top = SCREEN_HEIGHT
        if self.rect.top > SCREEN_HEIGHT:
            self.rect.bottom = 0

# Main game loop
def main():
    high_score = 0

    while True:
        clock = pygame.time.Clock()
        plane = Plane()
        
        # Generate circles in a circular pattern with random offsets
        circles = pygame.sprite.Group()
        center_x, center_y = SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2
        for i in range(NUM_CIRCLES):
            angle = i * (2 * math.pi / NUM_CIRCLES)
            x = center_x + CIRCLE_RADIUS * math.cos(angle) + random.randint(-START_POSITION_RANGE, START_POSITION_RANGE)
            y = center_y + CIRCLE_RADIUS * math.sin(angle) + random.randint(-START_POSITION_RANGE, START_POSITION_RANGE)
            direction = (-math.cos(angle), -math.sin(angle))
            circles.add(Circle((x, y), direction))
        
        all_sprites = pygame.sprite.Group(plane, *circles)
        running = True
        start_ticks = pygame.time.get_ticks()

        while running:
            screen.fill(BACKGROUND_COLOR)
            
            # Event handling
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

            keys = pygame.key.get_pressed()
            plane.update(keys)
            circles.update()

            # Check for collisions
            if pygame.sprite.spritecollideany(plane, circles):
                running = False  # End the current game loop to restart
                # Update high score if the current score is higher
                score = (pygame.time.get_ticks() - start_ticks) // 10
                if score > high_score:
                    high_score = score

            all_sprites.draw(screen)

            # Calculate and display the score
            seconds = (pygame.time.get_ticks() - start_ticks) / 1000
            score = int(seconds * SCORE_MULTIPLIER)
            score_text = font.render(f'Score: {score}', True, FONT_COLOR)
            high_score_text = font.render(f'High Score: {high_score}', True, FONT_COLOR)

            screen.blit(score_text, (10, 10))
            screen.blit(high_score_text, (10, 50))
            
            pygame.display.flip()
            clock.tick(60)

if __name__ == "__main__":
    main()
