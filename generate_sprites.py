#!/usr/bin/env python3
"""
Sprite generator for Shimeji Factory characters.
Generates 12 pose sprites + 1 icon per character at 128x128 RGBA PNG.
Uses 4x supersampling (draw at 512x512, downscale with LANCZOS).
"""

import os
from PIL import Image, ImageDraw

# --- Constants ---
FINAL_SIZE = 128
SUPER_SIZE = FINAL_SIZE * 4  # 512
OUTPUT_BASE = os.path.join(os.path.dirname(__file__), "chrome-extension", "characters")

POSES = [
    "stand-neutral",
    "walk-step-left",
    "walk-step-right",
    "fall",
    "bounce-squish",
    "bounce-recover",
    "sit",
    "dragged-tilt-left-light",
    "dragged-tilt-right-light",
    "resist-frame-1",
    "resist-frame-2",
]

# --- Helpers ---

def s(val):
    """Scale a value from 128-space to 512-space."""
    return int(val * 4)

def new_canvas():
    """Create a transparent 512x512 RGBA canvas."""
    return Image.new("RGBA", (SUPER_SIZE, SUPER_SIZE), (0, 0, 0, 0))

def finalize(img):
    """Downscale from 512x512 to 128x128."""
    return img.resize((FINAL_SIZE, FINAL_SIZE), Image.LANCZOS)

def save_sprite(img, character, pose):
    """Save a finalized sprite."""
    outdir = os.path.join(OUTPUT_BASE, character)
    os.makedirs(outdir, exist_ok=True)
    finalize(img).save(os.path.join(outdir, f"{pose}.png"))

def save_icon(img, character):
    """Save the icon (just stand-neutral)."""
    outdir = os.path.join(OUTPUT_BASE, character)
    os.makedirs(outdir, exist_ok=True)
    finalize(img).save(os.path.join(outdir, "icon.png"))

def outlined_ellipse(draw, bbox, fill, outline, width=4):
    """Draw a filled ellipse with outline."""
    draw.ellipse(bbox, fill=fill, outline=outline, width=s(width))

def outlined_rect(draw, bbox, fill, outline, width=4):
    """Draw a filled rectangle with outline."""
    draw.rectangle(bbox, fill=fill, outline=outline, width=s(width))

def outlined_polygon(draw, points, fill, outline, width=4):
    """Draw a filled polygon with outline."""
    draw.polygon(points, fill=fill, outline=outline)
    # Redraw outline thicker
    if len(points) >= 2:
        pts = list(points) + [points[0]]
        for i in range(len(pts) - 1):
            draw.line([pts[i], pts[i+1]], fill=outline, width=s(width))

def thick_line(draw, pts, fill, width=3):
    """Draw a thick line."""
    draw.line(pts, fill=fill, width=s(width))

def dot_eyes(draw, lx, ly, rx, ry, radius=5, color=(0, 0, 0, 255)):
    """Draw two dot eyes."""
    r = s(radius)
    draw.ellipse([s(lx)-r, s(ly)-r, s(lx)+r, s(ly)+r], fill=color)
    draw.ellipse([s(rx)-r, s(ry)-r, s(rx)+r, s(ry)+r], fill=color)

def small_mouth(draw, cx, cy, width=6, color=(0, 0, 0, 255)):
    """Draw a small smile/line mouth."""
    w = s(width)
    draw.arc([s(cx)-w, s(cy)-w//2, s(cx)+w, s(cy)+w], 0, 180, fill=color, width=s(2))


# ============================================================
# BUNNY
# ============================================================
BUNNY_BODY = (255, 245, 238, 255)       # Seashell white
BUNNY_INNER_EAR = (255, 182, 193, 255)  # Pink
BUNNY_OUTLINE = (74, 55, 40, 255)       # Warm gray-brown
BUNNY_NOSE = (255, 150, 170, 255)

def draw_bunny_ear(draw, cx, top_y, height, inner_w, tilt=0, flop=0):
    """Draw one bunny ear with optional tilt/flop."""
    # Ear is a tall ellipse
    hw = s(inner_w)
    hh = s(height)
    # Outer ear
    ear_bbox = [s(cx) - hw, s(top_y), s(cx) + hw, s(top_y) + hh]
    # Apply flop by shifting top
    ear_bbox[0] += s(tilt)
    ear_bbox[2] += s(tilt)
    if flop != 0:
        ear_bbox[0] += s(flop * 3)
        ear_bbox[2] += s(flop * 5)
    outlined_ellipse(draw, ear_bbox, BUNNY_BODY, BUNNY_OUTLINE, width=3)
    # Inner ear (smaller, pink)
    margin = s(4)
    inner_bbox = [ear_bbox[0] + margin, ear_bbox[1] + margin + s(3),
                  ear_bbox[2] - margin, ear_bbox[3] - margin - s(3)]
    draw.ellipse(inner_bbox, fill=BUNNY_INNER_EAR)

def draw_bunny(pose):
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    # Base positions (in 128-space, scaled via s())
    body_cx, body_cy = 64, 80
    head_cx, head_cy = 64, 52
    head_rx, head_ry = 24, 20

    # Pose adjustments
    tilt = 0
    ear_l_flop, ear_r_flop = 0, 0
    body_squish_x, body_squish_y = 0, 0
    eye_offset_x = 0
    leg_spread = 0
    show_tail = True

    if pose == "walk-step-left":
        tilt = -3
        ear_l_flop = -2
        leg_spread = -6
    elif pose == "walk-step-right":
        tilt = 3
        ear_r_flop = 2
        leg_spread = 6
    elif pose == "fall":
        head_cy -= 8
        body_cy -= 5
        ear_l_flop = -3
        ear_r_flop = 3
    elif pose == "bounce-squish":
        body_squish_y = 8
        head_cy += 6
        body_cy += 6
        ear_l_flop = -4
        ear_r_flop = 4
    elif pose == "bounce-recover":
        body_squish_y = -5
        head_cy -= 5
        body_cy -= 3
    elif pose == "sit":
        body_squish_y = 6
        head_cy += 4
        body_cy += 4
    elif pose == "dragged-tilt-left-light":
        tilt = -8
        head_cx -= 5
        body_cx -= 3
    elif pose == "dragged-tilt-right-light":
        tilt = 8
        head_cx += 5
        body_cx += 3
    elif pose == "resist-frame-1":
        tilt = -4
        eye_offset_x = -2
    elif pose == "resist-frame-2":
        tilt = 4
        eye_offset_x = 2

    # Cotton tail (behind body)
    if show_tail:
        tail_x = body_cx + 18
        tail_y = body_cy + 5
        outlined_ellipse(draw,
            [s(tail_x)-s(6), s(tail_y)-s(6), s(tail_x)+s(6), s(tail_y)+s(6)],
            BUNNY_BODY, BUNNY_OUTLINE, width=2)

    # Body (oval)
    bw = 20 + body_squish_x
    bh = 22 - body_squish_y
    outlined_ellipse(draw,
        [s(body_cx - bw), s(body_cy - bh + body_squish_y),
         s(body_cx + bw), s(body_cy + bh + body_squish_y)],
        BUNNY_BODY, BUNNY_OUTLINE, width=3)

    # Feet/paws
    foot_y = body_cy + bh + body_squish_y - 2
    lf_x = body_cx - 10 + leg_spread
    rf_x = body_cx + 10 + leg_spread
    for fx in [lf_x, rf_x]:
        outlined_ellipse(draw,
            [s(fx - 8), s(foot_y - 3), s(fx + 8), s(foot_y + 5)],
            BUNNY_BODY, BUNNY_OUTLINE, width=2)

    # Ears (behind head but drawn before head to overlap correctly)
    ear_h = 30
    ear_w = 9
    ear_top = head_cy - head_ry - ear_h + 5
    draw_bunny_ear(draw, head_cx - 12, ear_top, ear_h, ear_w, tilt=-tilt, flop=ear_l_flop)
    draw_bunny_ear(draw, head_cx + 12, ear_top, ear_h, ear_w, tilt=-tilt, flop=ear_r_flop)

    # Head
    outlined_ellipse(draw,
        [s(head_cx - head_rx + tilt), s(head_cy - head_ry),
         s(head_cx + head_rx + tilt), s(head_cy + head_ry)],
        BUNNY_BODY, BUNNY_OUTLINE, width=3)

    # Eyes
    eye_y = head_cy - 2
    dot_eyes(draw, head_cx - 9 + tilt + eye_offset_x, eye_y,
             head_cx + 9 + tilt + eye_offset_x, eye_y, radius=4)

    # Nose (small pink triangle/dot)
    nx, ny = head_cx + tilt + eye_offset_x, head_cy + 6
    r = s(3)
    draw.ellipse([s(nx)-r, s(ny)-r, s(nx)+r, s(ny)+r], fill=BUNNY_NOSE)

    # Mouth
    small_mouth(draw, nx, ny + 4, width=5)

    return img

def generate_bunny():
    for pose in POSES:
        img = draw_bunny(pose)
        save_sprite(img, "bunny", pose)
    save_icon(draw_bunny("stand-neutral"), "bunny")


# ============================================================
# KITTEN
# ============================================================
KITTEN_BODY = (255, 212, 163, 255)      # Orange-cream
KITTEN_OUTLINE = (61, 43, 31, 255)      # Dark brown
KITTEN_NOSE = (255, 150, 170, 255)      # Pink
KITTEN_STRIPE = (220, 170, 110, 255)    # Darker stripe

def draw_kitten_ear(draw, cx, cy, size, pointing="up"):
    """Draw a pointed triangular cat ear."""
    sz = s(size)
    if pointing == "up":
        pts = [(s(cx), s(cy) - sz), (s(cx) - sz, s(cy) + sz//2), (s(cx) + sz, s(cy) + sz//2)]
    else:
        pts = [(s(cx), s(cy) - sz//2), (s(cx) - sz, s(cy) + sz), (s(cx) + sz, s(cy) + sz)]
    outlined_polygon(draw, pts, KITTEN_BODY, KITTEN_OUTLINE, width=3)
    # Inner ear pink triangle
    inner = [(s(cx), s(cy) - sz + s(4)),
             (s(cx) - sz + s(4), s(cy) + sz//2 - s(2)),
             (s(cx) + sz - s(4), s(cy) + sz//2 - s(2))]
    draw.polygon(inner, fill=BUNNY_INNER_EAR)

def draw_whiskers(draw, cx, cy, side, tilt=0):
    """Draw 3 whiskers on one side."""
    direction = 1 if side == "right" else -1
    for i, angle_off in enumerate([-6, 0, 6]):
        x1 = s(cx)
        y1 = s(cy + angle_off)
        x2 = s(cx + direction * 20)
        y2 = s(cy + angle_off * 2 + tilt)
        draw.line([(x1, y1), (x2, y2)], fill=KITTEN_OUTLINE, width=s(2))

def draw_kitten_tail(draw, base_x, base_y, curl=0, angle=0):
    """Draw a curving tail."""
    # Simple curved tail using arcs
    tx, ty = s(base_x), s(base_y)
    r = s(20)
    # Draw as thick curved line segments
    import math
    points = []
    for i in range(12):
        t = i / 11.0
        px = tx + int(r * t * 1.2) + s(curl) * int(t * t * 10) + s(angle)
        py = ty - int(r * 0.8 * math.sin(t * 2.5 + curl * 0.1))
        points.append((px, py))
    if len(points) >= 2:
        draw.line(points, fill=KITTEN_OUTLINE, width=s(5), joint="curve")
        # Inner color
        draw.line(points, fill=KITTEN_BODY, width=s(3), joint="curve")

def draw_kitten(pose):
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    body_cx, body_cy = 64, 78
    head_cx, head_cy = 64, 48
    head_rx, head_ry = 22, 18

    tilt = 0
    body_squish = 0
    tail_curl = 1
    tail_angle = 0
    whisker_tilt = 0
    leg_offset = 0
    eye_squint = False

    if pose == "walk-step-left":
        tilt = -2
        leg_offset = -5
        tail_curl = -2
    elif pose == "walk-step-right":
        tilt = 2
        leg_offset = 5
        tail_curl = 2
    elif pose == "fall":
        head_cy -= 8
        body_cy -= 5
        tail_curl = 3
    elif pose == "bounce-squish":
        body_squish = 6
        head_cy += 5
        body_cy += 5
        tail_curl = -1
    elif pose == "bounce-recover":
        body_squish = -4
        head_cy -= 4
        body_cy -= 3
        tail_curl = 2
    elif pose == "sit":
        body_squish = 8
        head_cy += 4
        body_cy += 4
        eye_squint = True
        tail_angle = -10
    elif pose == "dragged-tilt-left-light":
        tilt = -8
        head_cx -= 4
        body_cx -= 3
        tail_curl = 3
    elif pose == "dragged-tilt-right-light":
        tilt = 8
        head_cx += 4
        body_cx += 3
        tail_curl = -3
    elif pose == "resist-frame-1":
        tilt = -3
        whisker_tilt = -3
    elif pose == "resist-frame-2":
        tilt = 3
        whisker_tilt = 3

    # Tail (behind body)
    draw_kitten_tail(draw, body_cx + 16, body_cy + 5, curl=tail_curl, angle=tail_angle)

    # Body
    bw = 18
    bh = 20 - body_squish
    outlined_ellipse(draw,
        [s(body_cx - bw), s(body_cy - bh + body_squish),
         s(body_cx + bw), s(body_cy + bh + body_squish)],
        KITTEN_BODY, KITTEN_OUTLINE, width=3)

    # Stripes on body
    for sy in range(-1, 2):
        stripe_y = body_cy + sy * 7
        draw.line([s(body_cx - 10), s(stripe_y), s(body_cx + 10), s(stripe_y)],
                  fill=KITTEN_STRIPE, width=s(2))

    # Paws/feet
    foot_y = body_cy + bh + body_squish - 2
    for fx_off in [-10, 10]:
        fx = body_cx + fx_off + leg_offset
        outlined_ellipse(draw,
            [s(fx - 7), s(foot_y - 2), s(fx + 7), s(foot_y + 4)],
            KITTEN_BODY, KITTEN_OUTLINE, width=2)

    # Ears
    draw_kitten_ear(draw, head_cx - 16 + tilt, head_cy - head_ry + 2, 12)
    draw_kitten_ear(draw, head_cx + 16 + tilt, head_cy - head_ry + 2, 12)

    # Head
    outlined_ellipse(draw,
        [s(head_cx - head_rx + tilt), s(head_cy - head_ry),
         s(head_cx + head_rx + tilt), s(head_cy + head_ry)],
        KITTEN_BODY, KITTEN_OUTLINE, width=3)

    # Eyes
    eye_y = head_cy - 2
    if eye_squint:
        # Squinted happy eyes (arcs)
        for ex in [head_cx - 8 + tilt, head_cx + 8 + tilt]:
            draw.arc([s(ex - 4), s(eye_y - 3), s(ex + 4), s(eye_y + 3)],
                     200, 340, fill=KITTEN_OUTLINE, width=s(3))
    else:
        dot_eyes(draw, head_cx - 8 + tilt, eye_y, head_cx + 8 + tilt, eye_y, radius=4)

    # Nose
    nx, ny = head_cx + tilt, head_cy + 4
    # Small inverted triangle nose
    nr = s(3)
    draw.polygon([(s(nx), s(ny) + nr), (s(nx) - nr, s(ny) - nr//2), (s(nx) + nr, s(ny) - nr//2)],
                 fill=KITTEN_NOSE)

    # Whiskers
    draw_whiskers(draw, head_cx - head_rx + 4 + tilt, head_cy + 3, "left", whisker_tilt)
    draw_whiskers(draw, head_cx + head_rx - 4 + tilt, head_cy + 3, "right", whisker_tilt)

    # Mouth
    small_mouth(draw, nx, ny + 4, width=4)

    return img

def generate_kitten():
    for pose in POSES:
        img = draw_kitten(pose)
        save_sprite(img, "kitten", pose)
    save_icon(draw_kitten("stand-neutral"), "kitten")


# ============================================================
# BLOB
# ============================================================
BLOB_BODY = (127, 232, 127, 255)        # Green
BLOB_OUTLINE = (45, 138, 45, 255)       # Darker green
BLOB_HIGHLIGHT = (200, 255, 200, 180)   # White-green specular

def draw_blob(pose):
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    cx, cy = 64, 68
    rx, ry = 28, 30  # width, height of blob

    # Pose shape modifications
    squish_x, squish_y = 0, 0
    lean = 0
    eye_mood = "normal"  # normal, happy, surprised

    if pose == "walk-step-left":
        lean = -8
        squish_x = -4
        squish_y = 3
    elif pose == "walk-step-right":
        lean = 8
        squish_x = 4
        squish_y = 3
    elif pose == "fall":
        # Tall raindrop shape
        squish_x = -8
        squish_y = -15
        cy -= 5
        eye_mood = "surprised"
    elif pose == "bounce-squish":
        # Flat pancake
        squish_x = 15
        squish_y = 15
        cy += 8
        eye_mood = "happy"
    elif pose == "bounce-recover":
        # Tall narrow rebound
        squish_x = -8
        squish_y = -10
        cy -= 5
    elif pose == "sit":
        # Extra flat
        squish_x = 10
        squish_y = 10
        cy += 5
        eye_mood = "happy"
    elif pose == "dragged-tilt-left-light":
        lean = -12
        squish_x = -3
    elif pose == "dragged-tilt-right-light":
        lean = 12
        squish_x = 3
    elif pose == "resist-frame-1":
        lean = -5
        # Small bumps (pseudopods)
        # Left bump
        outlined_ellipse(draw,
            [s(cx - rx - 8 + lean), s(cy - 5), s(cx - rx + 4 + lean), s(cy + 8)],
            BLOB_BODY, BLOB_OUTLINE, width=2)
    elif pose == "resist-frame-2":
        lean = 5
        # Right bump
        outlined_ellipse(draw,
            [s(cx + rx - 4 + lean), s(cy - 5), s(cx + rx + 8 + lean), s(cy + 8)],
            BLOB_BODY, BLOB_OUTLINE, width=2)

    # Main blob body
    bx1 = cx - rx - squish_x + lean
    by1 = cy - ry + squish_y
    bx2 = cx + rx + squish_x + lean
    by2 = cy + ry + squish_y
    outlined_ellipse(draw, [s(bx1), s(by1), s(bx2), s(by2)], BLOB_BODY, BLOB_OUTLINE, width=3)

    # Specular highlight (top-left)
    hl_cx = cx + lean - (rx // 3)
    hl_cy = cy - ry // 2 + squish_y // 2
    hl_r = 8
    draw.ellipse([s(hl_cx - hl_r), s(hl_cy - hl_r), s(hl_cx + hl_r - 2), s(hl_cy + hl_r - 4)],
                 fill=BLOB_HIGHLIGHT)

    # Eyes
    eye_y = cy + squish_y // 3
    lex = cx - 10 + lean
    rex = cx + 10 + lean
    if eye_mood == "happy":
        # Happy arc eyes
        for ex in [lex, rex]:
            draw.arc([s(ex - 5), s(eye_y - 4), s(ex + 5), s(eye_y + 4)],
                     200, 340, fill=(0, 0, 0, 255), width=s(3))
    elif eye_mood == "surprised":
        # Wide round eyes
        for ex in [lex, rex]:
            r = s(6)
            draw.ellipse([s(ex) - r, s(eye_y) - r, s(ex) + r, s(eye_y) + r], fill=(0, 0, 0, 255))
            # White pupil dot
            pr = s(2)
            draw.ellipse([s(ex) - pr + s(2), s(eye_y) - pr - s(1),
                          s(ex) + pr + s(2), s(eye_y) + pr - s(1)],
                         fill=(255, 255, 255, 255))
    else:
        dot_eyes(draw, lex, eye_y, rex, eye_y, radius=5)

    # Mouth
    mouth_y = eye_y + 10
    if eye_mood == "happy":
        # Big smile
        draw.arc([s(cx + lean - 8), s(mouth_y - 4), s(cx + lean + 8), s(mouth_y + 6)],
                 0, 180, fill=(0, 0, 0, 255), width=s(2))
    elif eye_mood == "surprised":
        # O mouth
        r = s(4)
        draw.ellipse([s(cx + lean) - r, s(mouth_y) - r, s(cx + lean) + r, s(mouth_y) + r],
                     outline=(0, 0, 0, 255), width=s(2))
    else:
        small_mouth(draw, cx + lean, mouth_y, width=5)

    return img

def generate_blob():
    for pose in POSES:
        img = draw_blob(pose)
        save_sprite(img, "blob", pose)
    save_icon(draw_blob("stand-neutral"), "blob")


# ============================================================
# GHOST
# ============================================================
GHOST_BODY = (240, 240, 255, 230)       # Pale blue-white, slightly transparent
GHOST_OUTLINE = (136, 136, 170, 255)    # Blue-gray
GHOST_BLUSH = (255, 180, 190, 150)      # Pink cheek blush
GHOST_EYE = (60, 60, 90, 255)           # Dark blue-gray eyes

def draw_ghost_body(draw, cx, cy, width, height, wave_offset=0, wave_amp=6, n_waves=3, squish_x=0, squish_y=0):
    """Draw ghost bell shape with wavy bottom edge."""
    import math

    w = width + squish_x
    h = height + squish_y

    # Build the outline as a polygon
    points = []

    # Top dome (semicircle, going left to right)
    dome_cy = cy - h // 2 + w // 2
    n_arc = 30
    for i in range(n_arc + 1):
        angle = math.pi + (math.pi * i / n_arc)
        px = cx + int(w * math.cos(angle))
        py = dome_cy + int(w * math.sin(angle)) - squish_y // 2
        points.append((s(px), s(py)))

    # Right side straight down
    right_x = cx + w
    bottom_y = cy + h // 2
    points.append((s(right_x), s(bottom_y)))

    # Wavy bottom edge (right to left)
    n_bottom = 40
    for i in range(n_bottom + 1):
        t = i / n_bottom
        px = right_x - int(2 * w * t)
        py = bottom_y + int(wave_amp * math.sin((t * n_waves + wave_offset * 0.3) * 2 * math.pi))
        points.append((s(px), s(py)))

    # Left side back up
    left_x = cx - w
    points.append((s(left_x), s(bottom_y)))

    # Draw filled polygon
    outlined_polygon(draw, points, GHOST_BODY, GHOST_OUTLINE, width=3)

def draw_ghost(pose):
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    cx, cy = 64, 60
    width, height = 26, 50
    wave_offset = 0
    wave_amp = 6
    squish_x, squish_y = 0, 0
    eye_offset_x = 0
    rotation = 0  # degrees
    hollow_eyes = True
    mouth_type = "o"  # "o" or "flat"

    if pose == "stand-neutral":
        pass
    elif pose == "walk-step-left":
        cx -= 3
        wave_offset = 1
    elif pose == "walk-step-right":
        cx += 3
        wave_offset = 2
    elif pose == "fall":
        # Elongated, waves stream upward
        squish_y = 10
        squish_x = -5
        cy -= 3
        wave_amp = 8
    elif pose == "bounce-squish":
        # Compressed, waves spread wide
        squish_y = -15
        squish_x = 10
        cy += 8
        wave_amp = 4
    elif pose == "bounce-recover":
        # Elongated upward
        squish_y = 8
        squish_x = -5
        cy -= 5
    elif pose == "sit":
        # Settled, waves flat
        squish_y = -10
        squish_x = 5
        cy += 5
        wave_amp = 2
        mouth_type = "flat"
    elif pose == "dragged-tilt-left-light":
        cx -= 6
        eye_offset_x = -3
        wave_offset = -1
    elif pose == "dragged-tilt-right-light":
        cx += 6
        eye_offset_x = 3
        wave_offset = 1
    elif pose == "resist-frame-1":
        eye_offset_x = -2
        # Small arm bumps
        arm_y = cy - 5
        outlined_ellipse(draw,
            [s(cx - width - 10), s(arm_y - 4), s(cx - width + 2), s(arm_y + 6)],
            GHOST_BODY, GHOST_OUTLINE, width=2)
    elif pose == "resist-frame-2":
        eye_offset_x = 2
        arm_y = cy - 5
        outlined_ellipse(draw,
            [s(cx + width - 2), s(arm_y - 4), s(cx + width + 10), s(arm_y + 6)],
            GHOST_BODY, GHOST_OUTLINE, width=2)

    # Draw body
    draw_ghost_body(draw, cx, cy, width, height, wave_offset, wave_amp,
                    squish_x=squish_x, squish_y=squish_y)

    # Eyes - hollow ovals
    eye_y = cy - 10 + squish_y // 4
    lex = cx - 10 + eye_offset_x
    rex = cx + 10 + eye_offset_x
    eye_rx, eye_ry = 6, 8
    for ex in [lex, rex]:
        # Hollow oval eye
        draw.ellipse([s(ex - eye_rx), s(eye_y - eye_ry), s(ex + eye_rx), s(eye_y + eye_ry)],
                     outline=GHOST_EYE, width=s(3))

    # Blush cheeks
    blush_y = eye_y + 10
    for bx in [cx - 16 + eye_offset_x, cx + 16 + eye_offset_x]:
        draw.ellipse([s(bx - 5), s(blush_y - 3), s(bx + 5), s(blush_y + 3)],
                     fill=GHOST_BLUSH)

    # Mouth
    mouth_y = eye_y + 14
    mx = cx + eye_offset_x
    if mouth_type == "o":
        r = s(4)
        draw.ellipse([s(mx) - r, s(mouth_y) - r, s(mx) + r, s(mouth_y) + r],
                     outline=GHOST_EYE, width=s(2))
    else:
        draw.line([s(mx - 4), s(mouth_y), s(mx + 4), s(mouth_y)],
                  fill=GHOST_EYE, width=s(2))

    return img

def generate_ghost():
    for pose in POSES:
        img = draw_ghost(pose)
        save_sprite(img, "ghost", pose)
    save_icon(draw_ghost("stand-neutral"), "ghost")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("Generating Bunny sprites...")
    generate_bunny()
    print("Generating Kitten sprites...")
    generate_kitten()
    print("Generating Blob sprites...")
    generate_blob()
    print("Generating Ghost sprites...")
    generate_ghost()
    print("Done! All sprites generated.")
