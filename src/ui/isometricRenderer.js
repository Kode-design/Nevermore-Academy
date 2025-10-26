const TILE_WIDTH = 72;
const TILE_HEIGHT = 40;

const TILE_COLORS = {
  floor: "#1f2236",
  quest: "#27304f",
  combat: "#2f2a3f",
  ritual: "#2d3b3b",
  wall: "#11131f"
};

export function renderIsometricScene(ctx, world, options) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = TILE_HEIGHT * 2;

  for (let y = 0; y < world.mapHeight; y += 1) {
    for (let x = 0; x < world.mapWidth; x += 1) {
      const tile = world.tiles[y][x];
      const { screenX, screenY } = isoToScreen(x, y, centerX, centerY);
      drawTile(ctx, screenX, screenY, TILE_COLORS[tile.type] || TILE_COLORS.floor, tile.type === "wall");

      if (tile.type === "quest") {
        drawGlyph(ctx, screenX, screenY, "?", "#93a4ff");
      }
      if (tile.type === "combat") {
        drawGlyph(ctx, screenX, screenY, "!", "#f48fb1");
      }
      if (tile.type === "ritual") {
        drawGlyph(ctx, screenX, screenY, "✶", "#7fe0d6");
      }
    }
  }

  if (options.path) {
    ctx.strokeStyle = "rgba(147, 164, 255, 0.45)";
    ctx.lineWidth = 2;
    options.path.forEach(({ x, y }) => {
      const { screenX, screenY } = isoToScreen(x, y, centerX, centerY);
      drawTileOutline(ctx, screenX, screenY);
    });
  }

  drawActor(ctx, options.playerPosition, centerX, centerY, "#f0b5ff", "You");

  if (options.companionPosition) {
    drawActor(ctx, options.companionPosition, centerX, centerY, "#7fe0d6", "Isolde");
  }
}

function drawTile(ctx, x, y, color, raised = false) {
  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;
  ctx.beginPath();
  ctx.moveTo(x, y - halfH);
  ctx.lineTo(x + halfW, y);
  ctx.lineTo(x, y + halfH);
  ctx.lineTo(x - halfW, y);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(x, y - halfH, x, y + halfH);
  gradient.addColorStop(0, lighten(color, raised ? 0.3 : 0.15));
  gradient.addColorStop(1, color);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(147, 164, 255, 0.2)";
  ctx.stroke();
}

function drawTileOutline(ctx, x, y) {
  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;
  ctx.beginPath();
  ctx.moveTo(x, y - halfH);
  ctx.lineTo(x + halfW, y);
  ctx.lineTo(x, y + halfH);
  ctx.lineTo(x - halfW, y);
  ctx.closePath();
  ctx.stroke();
}

function drawGlyph(ctx, x, y, glyph, color) {
  ctx.save();
  ctx.font = "18px 'Crimson Pro', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(glyph, x, y + 4);
  ctx.restore();
}

function drawActor(ctx, position, centerX, centerY, color, label) {
  if (!position) return;
  const { screenX, screenY } = isoToScreen(position.x, position.y, centerX, centerY - 6);
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(screenX, screenY - 10, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.stroke();
  ctx.font = "12px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(label, screenX, screenY + 6);
  ctx.restore();
}

function isoToScreen(x, y, centerX, centerY) {
  const screenX = centerX + (x - y) * (TILE_WIDTH / 2);
  const screenY = centerY + (x + y) * (TILE_HEIGHT / 2);
  return { screenX, screenY };
}

function lighten(color, intensity) {
  const rgb = parseColor(color);
  if (!rgb) return color;
  const r = clamp(rgb.r + 255 * intensity, 0, 255);
  const g = clamp(rgb.g + 255 * intensity, 0, 255);
  const b = clamp(rgb.b + 255 * intensity, 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function parseColor(color) {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const bigint = parseInt(hex, 16);
    if (hex.length === 6) {
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
      };
    }
  }
  return null;
}
