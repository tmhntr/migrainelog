import SwiftUI

/**
 The app draws its iconography with `MaterialIcons` from `@expo/vector-icons`.
 SF Symbols have no faithful equivalents for `change-history`, `blur-on`, or
 `medication`, and hand-tracing the paths would drift from the app the first
 time a glyph changed. So the widget target bundles the same `MaterialIcons.ttf`
 the app ships and renders the same code points — the icons are identical by
 construction, not by resemblance.

 The font is registered through `UIAppFonts` in this target's `Info.plist`.
 Code points come from `@expo/vector-icons`' `MaterialIcons.json` glyph map; the
 comment on each case is the JS name passed to `<MaterialIcons name="…" />`.
 */
enum MaterialIcon: String {
    /// `change-history` — the trigger mark, an outlined triangle.
    case trigger = "\u{e86b}"
    /// `blur-on` — the episode mark, a diffusing dot field.
    case episode = "\u{e3a5}"
    /// `medication` — the treatment mark.
    case treatment = "\u{f033}"
    /// `insights` — the dashboard mark.
    case insights = "\u{f092}"
    /// `schedule` — used for the freshness stamp.
    case schedule = "\u{e8b5}"

    static let familyName = "Material Icons"
}

/**
 A glyph laid out on a square of its own nominal size.

 `MaterialIcons.ttf` reports ascent = 1em and descent = 0, so a line box at size
 `size` is exactly `size` tall and the glyph fills it. That means a plain centred
 frame lands optically centred with no nudge constants — worth knowing before
 anyone "fixes" the alignment with a magic offset.
 */
struct MaterialIconView: View {
    let icon: MaterialIcon
    var size: CGFloat
    var color: Color

    init(_ icon: MaterialIcon, size: CGFloat = 20, color: Color = Theme.ink) {
        self.icon = icon
        self.size = size
        self.color = color
    }

    var body: some View {
        Text(icon.rawValue)
            .font(.custom(MaterialIcon.familyName, fixedSize: size))
            .foregroundStyle(color)
            .frame(width: size, height: size)
            // The glyph is decorative; the enclosing control carries the label.
            .accessibilityHidden(true)
    }
}
