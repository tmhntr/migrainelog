import SwiftUI
import UIKit

/**
 A Swift mirror of `src/theme/tokens.ts` and `src/theme/palette.ts`.

 The widget cannot import the app's TypeScript design system, so the tokens are
 restated here. They are restated *literally* — same hex values, same 4pt grid,
 same nine-role type scale — so the widget and the app read as one surface. If a
 token changes on the JS side, change it here in the same commit.

 The same two constraints from `palette.ts` apply, and for the same reason: this
 is read by someone photophobic, often mid-attack.

  1. No pure white and no pure black.
  2. The risk ramp climbs warmer and darker, never brighter.
 */

// MARK: - Colour construction

extension Color {
    /// Resolves per trait collection, so the widget follows the system scheme
    /// the way `app.json`'s `userInterfaceStyle: automatic` makes the app do.
    init(light: UInt32, dark: UInt32) {
        self.init(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(rgbHex: dark)
                : UIColor(rgbHex: light)
        })
    }
}

private extension UIColor {
    convenience init(rgbHex: UInt32) {
        self.init(
            red: CGFloat((rgbHex >> 16) & 0xFF) / 255,
            green: CGFloat((rgbHex >> 8) & 0xFF) / 255,
            blue: CGFloat(rgbHex & 0xFF) / 255,
            alpha: 1
        )
    }
}

// MARK: - Scales

/// 4pt base grid. Every gap and inset in the widget comes from here.
enum Space {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
}

enum Radius {
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 20
    static let pill: CGFloat = 999
}

/// The system leans on hairlines and surface lift instead of drop shadows —
/// shadows read as noise on the light ground and vanish on the dark one.
enum BorderWidth {
    static let hairline: CGFloat = 1
    static let thick: CGFloat = 2
}

// MARK: - Type scale

/// The nine roles from `tokens.ts`. Numeric variants carry monospaced digits so
/// the score does not jitter between timeline refreshes.
enum TypeScale {
    static let display = Font.system(size: 44, weight: .light).monospacedDigit()
    static let metric = Font.system(size: 26, weight: .semibold).monospacedDigit()
    static let title = Font.system(size: 22, weight: .semibold)
    static let heading = Font.system(size: 17, weight: .semibold)
    static let body = Font.system(size: 15, weight: .regular)
    static let bodyStrong = Font.system(size: 15, weight: .semibold)
    static let label = Font.system(size: 13, weight: .medium)
    static let data = Font.system(size: 13, weight: .medium).monospacedDigit()
    static let caption = Font.system(size: 11, weight: .semibold)

    /// `display` is set light rather than bold on purpose: at 44pt a heavy
    /// weight reads as alarm, and the risk readout should not shout at someone
    /// who is already in pain. Tracking matches the JS `letterSpacing`.
    static let displayTracking: CGFloat = -1
    static let titleTracking: CGFloat = -0.3
    static let headingTracking: CGFloat = -0.2
    /// The instrument-label voice: small, tracked out, uppercased at the call site.
    static let captionTracking: CGFloat = 0.8
}

// MARK: - Colour roles

/// Fill / on-fill / soft-tint triple, matching `RiskColors` in `palette.ts`.
struct Tone {
    let base: Color
    let on: Color
    let soft: Color

    init(light: (UInt32, UInt32, UInt32), dark: (UInt32, UInt32, UInt32)) {
        base = Color(light: light.0, dark: dark.0)
        on = Color(light: light.1, dark: dark.1)
        soft = Color(light: light.2, dark: dark.2)
    }
}

enum Theme {
    static let background = Color(light: 0xF2F0EC, dark: 0x0F1013)
    static let surface = Color(light: 0xFAF8F5, dark: 0x191A1F)
    static let surfaceRaised = Color(light: 0xFDFCFA, dark: 0x212229)

    static let border = Color(light: 0xDFDBD3, dark: 0x2C2D35)
    static let borderStrong = Color(light: 0xC6C1B7, dark: 0x3E3F49)

    static let ink = Color(light: 0x232227, dark: 0xE4E2E6)
    static let inkMuted = Color(light: 0x605D68, dark: 0x9C99A5)
    static let inkFaint = Color(light: 0x8B8794, dark: 0x6E6B78)

    static let accent = Color(light: 0x4A5A7A, dark: 0x8FA3C8)
    static let accentInk = Color(light: 0xF3F5F9, dark: 0x111419)
    static let accentSoft = Color(light: 0xE2E7EF, dark: 0x1E2430)

    // The four-step risk ramp. Warmer and darker as it climbs — high risk is a
    // desaturated rose, not a saturated red.
    static let riskLow = Tone(light: (0x5B7A6E, 0xF4F6F4, 0xE3EAE6),
                              dark: (0x7FA394, 0x101714, 0x1B2723))
    static let riskModerate = Tone(light: (0x8A8352, 0xF7F6F1, 0xEDEBDF),
                                   dark: (0xB3AA73, 0x17160F, 0x272517))
    static let riskHigh = Tone(light: (0xA6714E, 0xFAF5F1, 0xF1E5DC),
                               dark: (0xC89470, 0x1A120C, 0x2B1F16))
    static let riskCritical = Tone(light: (0x9E5259, 0xFAF3F3, 0xF0DFE0),
                                   dark: (0xC4787F, 0x180F10, 0x2B1B1D))

    // Event types borrow from the risk ramp so the two languages agree: a
    // trigger always reads ochre, an episode always rose, a treatment slate.
    static let eventTrigger = riskModerate
    static let eventEpisode = riskCritical
    static let eventTreatment = Tone(light: (0x4A5A7A, 0xF3F5F9, 0xE2E7EF),
                                     dark: (0x8FA3C8, 0x111419, 0x1E2430))
}
