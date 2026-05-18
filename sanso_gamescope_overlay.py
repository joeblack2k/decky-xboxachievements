#!/usr/bin/env python3
import ctypes
import math
import os
import sys
import time

import cairo
import gi

gi.require_version("Pango", "1.0")
gi.require_version("PangoCairo", "1.0")
from gi.repository import Pango, PangoCairo


def _load(names):
    for name in names:
        try:
            return ctypes.CDLL(name)
        except OSError:
            pass
    raise OSError(f"Unable to load any of: {', '.join(names)}")


glfw = _load(("libglfw.so.3", "libglfw.so"))
gl = _load(("libGL.so.1", "libGL.so"))
x11 = _load(("libX11.so.6", "libX11.so"))

GLFW_FALSE = 0
GLFW_TRUE = 1
GLFW_FOCUSED = 0x00020001
GLFW_RESIZABLE = 0x00020003
GLFW_VISIBLE = 0x00020004
GLFW_DECORATED = 0x00020005
GLFW_FLOATING = 0x00020007
GLFW_FOCUS_ON_SHOW = 0x0002000C
GLFW_MOUSE_PASSTHROUGH = 0x0002000D
GLFW_TRANSPARENT_FRAMEBUFFER = 0x0002000A
GLFW_X11_CLASS_NAME = 0x00024001
GLFW_X11_INSTANCE_NAME = 0x00024002
GLFW_DEPTH_BITS = 0x00021005
GLFW_STENCIL_BITS = 0x00021006
GLFW_CONTEXT_VERSION_MAJOR = 0x00022002
GLFW_CONTEXT_VERSION_MINOR = 0x00022003

GL_COLOR_BUFFER_BIT = 0x00004000
GL_TEXTURE_2D = 0x0DE1
GL_RGBA = 0x1908
GL_BGRA = 0x80E1
GL_UNSIGNED_BYTE = 0x1401
GL_BLEND = 0x0BE2
GL_ONE = 1
GL_ONE_MINUS_SRC_ALPHA = 0x0303
GL_PROJECTION = 0x1701
GL_MODELVIEW = 0x1700
GL_QUADS = 0x0007
GL_TEXTURE_MIN_FILTER = 0x2801
GL_TEXTURE_MAG_FILTER = 0x2800
GL_LINEAR = 0x2601


def _configure_ctypes():
    glfw.glfwInit.restype = ctypes.c_int
    glfw.glfwWindowHint.argtypes = (ctypes.c_int, ctypes.c_int)
    glfw.glfwWindowHintString.argtypes = (ctypes.c_int, ctypes.c_char_p)
    glfw.glfwCreateWindow.argtypes = (ctypes.c_int, ctypes.c_int, ctypes.c_char_p, ctypes.c_void_p, ctypes.c_void_p)
    glfw.glfwCreateWindow.restype = ctypes.c_void_p
    glfw.glfwMakeContextCurrent.argtypes = (ctypes.c_void_p,)
    glfw.glfwSwapInterval.argtypes = (ctypes.c_int,)
    glfw.glfwSwapBuffers.argtypes = (ctypes.c_void_p,)
    glfw.glfwPollEvents.restype = None
    glfw.glfwSetWindowPos.argtypes = (ctypes.c_void_p, ctypes.c_int, ctypes.c_int)
    glfw.glfwShowWindow.argtypes = (ctypes.c_void_p,)
    glfw.glfwTerminate.restype = None
    glfw.glfwGetX11Display.restype = ctypes.c_void_p
    glfw.glfwGetX11Window.argtypes = (ctypes.c_void_p,)
    glfw.glfwGetX11Window.restype = ctypes.c_ulong

    x11.XOpenDisplay.argtypes = (ctypes.c_char_p,)
    x11.XOpenDisplay.restype = ctypes.c_void_p
    x11.XDefaultScreen.argtypes = (ctypes.c_void_p,)
    x11.XDefaultScreen.restype = ctypes.c_int
    x11.XDisplayWidth.argtypes = (ctypes.c_void_p, ctypes.c_int)
    x11.XDisplayWidth.restype = ctypes.c_int
    x11.XDisplayHeight.argtypes = (ctypes.c_void_p, ctypes.c_int)
    x11.XDisplayHeight.restype = ctypes.c_int
    x11.XCloseDisplay.argtypes = (ctypes.c_void_p,)
    x11.XInternAtom.argtypes = (ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int)
    x11.XInternAtom.restype = ctypes.c_ulong
    x11.XChangeProperty.argtypes = (
        ctypes.c_void_p,
        ctypes.c_ulong,
        ctypes.c_ulong,
        ctypes.c_ulong,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.POINTER(ctypes.c_ulong),
        ctypes.c_int,
    )
    x11.XFlush.argtypes = (ctypes.c_void_p,)

    gl.glViewport.argtypes = (ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int)
    gl.glClearColor.argtypes = (ctypes.c_float, ctypes.c_float, ctypes.c_float, ctypes.c_float)
    gl.glClear.argtypes = (ctypes.c_uint,)
    gl.glEnable.argtypes = (ctypes.c_uint,)
    gl.glBlendFunc.argtypes = (ctypes.c_uint, ctypes.c_uint)
    gl.glMatrixMode.argtypes = (ctypes.c_uint,)
    gl.glLoadIdentity.restype = None
    gl.glOrtho.argtypes = (ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double)
    gl.glColor4f.argtypes = (ctypes.c_float, ctypes.c_float, ctypes.c_float, ctypes.c_float)
    gl.glGenTextures.argtypes = (ctypes.c_int, ctypes.POINTER(ctypes.c_uint))
    gl.glBindTexture.argtypes = (ctypes.c_uint, ctypes.c_uint)
    gl.glTexParameteri.argtypes = (ctypes.c_uint, ctypes.c_uint, ctypes.c_int)
    gl.glTexImage2D.argtypes = (
        ctypes.c_uint,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_uint,
        ctypes.c_uint,
        ctypes.c_void_p,
    )
    gl.glBegin.argtypes = (ctypes.c_uint,)
    gl.glEnd.restype = None
    gl.glTexCoord2f.argtypes = (ctypes.c_float, ctypes.c_float)
    gl.glVertex2f.argtypes = (ctypes.c_float, ctypes.c_float)


def _display_size() -> tuple[int, int]:
    if os.environ.get("SANSO_WIDTH") and os.environ.get("SANSO_HEIGHT"):
        return int(os.environ["SANSO_WIDTH"]), int(os.environ["SANSO_HEIGHT"])
    display = x11.XOpenDisplay(os.environ.get("DISPLAY", ":0").encode())
    if not display:
        return 1280, 800
    try:
        screen = x11.XDefaultScreen(display)
        return x11.XDisplayWidth(display, screen), x11.XDisplayHeight(display, screen)
    finally:
        x11.XCloseDisplay(display)


def _rounded_rect(ctx, x, y, w, h, r):
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    ctx.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
    ctx.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
    ctx.close_path()


def _text(ctx, text, x, y, size, color, weight=Pango.Weight.BOLD, width=None):
    layout = PangoCairo.create_layout(ctx)
    desc = Pango.FontDescription()
    desc.set_family("DejaVu Sans")
    desc.set_absolute_size(size * Pango.SCALE)
    desc.set_weight(weight)
    layout.set_font_description(desc)
    layout.set_text(text, -1)
    if width:
        layout.set_width(int(width * Pango.SCALE))
        layout.set_ellipsize(Pango.EllipsizeMode.END)
    ctx.set_source_rgba(*color)
    ctx.move_to(x, y)
    PangoCairo.show_layout(ctx, layout)


def _clamp(value, low, high):
    return max(low, min(high, value))


def _ease_out(value):
    value = _clamp(value, 0.0, 1.0)
    return 1 - (1 - value) ** 3


def _ease_in(value):
    value = _clamp(value, 0.0, 1.0)
    return value ** 3


def _animation_state(progress):
    if progress < 0.22:
        open_amount = _ease_out(progress / 0.22)
        alpha = _ease_out(progress / 0.08)
        y_offset = 20 * (1 - open_amount)
    elif progress > 0.84:
        close_amount = _ease_in((progress - 0.84) / 0.16)
        open_amount = 1 - close_amount
        alpha = 1 - close_amount
        y_offset = 16 * close_amount
    else:
        open_amount = 1.0
        alpha = 1.0
        y_offset = 0.0
    text_alpha = _clamp((open_amount - 0.55) / 0.45, 0.0, 1.0) * alpha
    return open_amount, alpha, text_alpha, y_offset


def _make_surface(width, height, scale, title, subtitle, is_rare, progress):
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, width, height)
    ctx = cairo.Context(surface)
    ctx.set_operator(cairo.OPERATOR_CLEAR)
    ctx.paint()
    ctx.set_operator(cairo.OPERATOR_OVER)

    logical_w = width / scale
    logical_h = height / scale
    ctx.scale(scale, scale)

    open_amount, alpha, text_alpha, y_offset = _animation_state(progress)
    full_banner_w = 930
    start_w = 112
    banner_w = start_w + (full_banner_w - start_w) * open_amount
    banner_h = 108
    x = (logical_w - banner_w) / 2
    y = (logical_h - banner_h) / 2 + y_offset
    main = (0.72, 0.42, 0.02, 0.94 * alpha) if not is_rare else (0.44, 0.30, 0.05, 0.95 * alpha)
    accent = (1.00, 0.62, 0.02, alpha) if not is_rare else (0.98, 0.78, 0.28, alpha)

    _rounded_rect(ctx, x + 7, y + 8, banner_w, banner_h, 48)
    ctx.set_source_rgba(0.03, 0.02, 0.00, 0.36 * alpha)
    ctx.fill()

    _rounded_rect(ctx, x, y, banner_w, banner_h, 48)
    ctx.set_source_rgba(*main)
    ctx.fill_preserve()
    ctx.set_line_width(2.2)
    ctx.set_source_rgba(1.0, 0.93, 0.72, 0.86 * alpha)
    ctx.stroke()

    cx = x + 72
    cy = y + banner_h / 2
    ctx.arc(cx, cy, 52, 0, math.tau)
    ctx.set_source_rgba(*accent)
    ctx.fill_preserve()
    ctx.set_line_width(4)
    ctx.set_source_rgba(0.56, 0.31, 0.00, alpha)
    ctx.stroke()

    ctx.arc(cx, cy, 39, 0, math.tau)
    ctx.set_source_rgba(0.83, 1.0, 1.0, alpha)
    ctx.fill()

    ctx.set_source_rgba(0.40, 0.48, 0.50, alpha)
    for i, pt in enumerate([(cx - 17, cy - 8), (cx - 7, cy - 19), (cx + 7, cy - 19), (cx + 17, cy - 8), (cx, cy + 19)]):
        (ctx.move_to if i == 0 else ctx.line_to)(*pt)
    ctx.close_path()
    ctx.fill()
    ctx.set_source_rgba(0.85, 0.95, 0.96, alpha)
    ctx.set_line_width(3)
    ctx.move_to(cx - 17, cy - 8)
    ctx.line_to(cx + 17, cy - 8)
    ctx.move_to(cx - 7, cy - 19)
    ctx.line_to(cx, cy + 19)
    ctx.move_to(cx + 7, cy - 19)
    ctx.line_to(cx, cy + 19)
    ctx.stroke()

    if text_alpha > 0:
        shine_x = x + 105 + (full_banner_w - 180) * _clamp((progress - 0.24) / 0.46, 0, 1)
        ctx.save()
        _rounded_rect(ctx, x, y, banner_w, banner_h, 48)
        ctx.clip()
        ctx.translate(shine_x, y - 10)
        ctx.rotate(-0.28)
        ctx.rectangle(-16, 0, 32, banner_h + 28)
        ctx.set_source_rgba(1, 1, 1, 0.12 * text_alpha)
        ctx.fill()
        ctx.restore()

        ctx.save()
        _rounded_rect(ctx, x, y, banner_w, banner_h, 48)
        ctx.clip()
        _text(ctx, title, x + 145, y + 34, 27, (1, 1, 1, text_alpha), width=full_banner_w - 190)
        if subtitle:
            _text(ctx, subtitle, x + 145, y + 67, 17, (0.98, 0.91, 0.78, 0.90 * text_alpha), Pango.Weight.NORMAL, full_banner_w - 190)
        ctx.restore()

    surface.flush()
    return surface


def _set_cardinal(display, window, name, value=1):
    atom = x11.XInternAtom(display, name.encode("ascii"), 0)
    cardinal = x11.XInternAtom(display, b"CARDINAL", 0)
    data = (ctypes.c_ulong * 1)(value)
    x11.XChangeProperty(display, window, atom, cardinal, 32, 0, data, 1)


def main():
    _configure_ctypes()
    title = os.environ.get("SANSO_TITLE", sys.argv[1] if len(sys.argv) > 1 else "Achievement Unlocked")
    subtitle = os.environ.get("SANSO_SUBTITLE", sys.argv[2] if len(sys.argv) > 2 else "")
    is_rare = os.environ.get("SANSO_RARE", "0") == "1"
    seconds = float(os.environ.get("SANSO_SECONDS", "5.8"))
    width, height = _display_size()

    if not glfw.glfwInit():
        raise SystemExit("glfwInit failed")
    try:
        for hint, value in (
            (GLFW_CONTEXT_VERSION_MAJOR, 3),
            (GLFW_CONTEXT_VERSION_MINOR, 0),
            (GLFW_DEPTH_BITS, 0),
            (GLFW_STENCIL_BITS, 0),
            (GLFW_DECORATED, GLFW_FALSE),
            (GLFW_RESIZABLE, GLFW_TRUE),
            (GLFW_VISIBLE, GLFW_FALSE),
            (GLFW_FLOATING, GLFW_TRUE),
            (GLFW_FOCUSED, GLFW_FALSE),
            (GLFW_FOCUS_ON_SHOW, GLFW_FALSE),
            (GLFW_MOUSE_PASSTHROUGH, GLFW_TRUE),
            (GLFW_TRANSPARENT_FRAMEBUFFER, GLFW_TRUE),
        ):
            glfw.glfwWindowHint(hint, value)
        glfw.glfwWindowHintString(GLFW_X11_CLASS_NAME, b"mangoapp overlay window")
        glfw.glfwWindowHintString(GLFW_X11_INSTANCE_NAME, b"mangoapp overlay window")

        win = glfw.glfwCreateWindow(width, height, b"mangoapp overlay window", None, None)
        if not win:
            raise SystemExit("glfwCreateWindow failed")
        glfw.glfwSetWindowPos(win, 0, 0)
        glfw.glfwMakeContextCurrent(win)
        glfw.glfwSwapInterval(1)

        display = glfw.glfwGetX11Display()
        xwin = glfw.glfwGetX11Window(win)
        _set_cardinal(display, xwin, "GAMESCOPE_EXTERNAL_OVERLAY", 1)
        _set_cardinal(display, xwin, "GAMESCOPE_NO_FOCUS", 1)
        x11.XFlush(display)

        scale = _clamp(min(width / 1920, height / 1080), 0.85, 2.0)
        card_width = int((930 + 34) * scale)
        card_height = int((108 + 34) * scale)
        card_x = int((width - card_width) / 2)
        card_y = int(height - card_height - (70 * scale))

        surface = _make_surface(card_width, card_height, scale, title, subtitle, is_rare, 0.0)
        texture_buf = ctypes.create_string_buffer(bytes(surface.get_data()))
        tex = ctypes.c_uint()
        gl.glGenTextures(1, ctypes.byref(tex))
        gl.glBindTexture(GL_TEXTURE_2D, tex.value)
        gl.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
        gl.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
        gl.glTexImage2D(
            GL_TEXTURE_2D,
            0,
            GL_RGBA,
            card_width,
            card_height,
            0,
            GL_BGRA,
            GL_UNSIGNED_BYTE,
            ctypes.cast(texture_buf, ctypes.c_void_p),
        )

        def draw_card(progress):
            surface = _make_surface(card_width, card_height, scale, title, subtitle, is_rare, progress)
            frame_buf = ctypes.create_string_buffer(bytes(surface.get_data()))
            gl.glBindTexture(GL_TEXTURE_2D, tex.value)
            gl.glTexImage2D(
                GL_TEXTURE_2D,
                0,
                GL_RGBA,
                card_width,
                card_height,
                0,
                GL_BGRA,
                GL_UNSIGNED_BYTE,
                ctypes.cast(frame_buf, ctypes.c_void_p),
            )

            _open_amount, alpha, _text_alpha, y_offset = _animation_state(progress)
            y_shift = y_offset * scale

            gl.glViewport(0, 0, width, height)
            gl.glClearColor(0, 0, 0, 0)
            gl.glClear(GL_COLOR_BUFFER_BIT)
            gl.glEnable(GL_BLEND)
            gl.glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA)
            gl.glEnable(GL_TEXTURE_2D)
            gl.glBindTexture(GL_TEXTURE_2D, tex.value)
            gl.glColor4f(1.0, 1.0, 1.0, alpha)
            gl.glMatrixMode(GL_PROJECTION)
            gl.glLoadIdentity()
            gl.glOrtho(0, width, height, 0, -1, 1)
            gl.glMatrixMode(GL_MODELVIEW)
            gl.glLoadIdentity()
            gl.glBegin(GL_QUADS)
            gl.glTexCoord2f(0, 0)
            gl.glVertex2f(card_x, card_y + y_shift)
            gl.glTexCoord2f(1, 0)
            gl.glVertex2f(card_x + card_width, card_y + y_shift)
            gl.glTexCoord2f(1, 1)
            gl.glVertex2f(card_x + card_width, card_y + card_height + y_shift)
            gl.glTexCoord2f(0, 1)
            gl.glVertex2f(card_x, card_y + card_height + y_shift)
            gl.glEnd()
            glfw.glfwSwapBuffers(win)
            glfw.glfwPollEvents()

        draw_card(0.0)
        glfw.glfwShowWindow(win)
        x11.XFlush(display)

        started_at = time.time()
        deadline = started_at + seconds
        while time.time() < deadline:
            progress = _clamp((time.time() - started_at) / seconds, 0.0, 1.0)
            draw_card(progress)
    finally:
        glfw.glfwTerminate()


if __name__ == "__main__":
    main()
