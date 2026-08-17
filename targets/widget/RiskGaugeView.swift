import SwiftUI

/**
 A port of `src/components/RiskGauge.tsx`.

 The previous widget drew a circular progress ring in stock `.red` / `.orange` /
 `.yellow` / `.green`, which was a second, louder risk language sitting next to
 the app's. This is the app's own instrument: a ramped tick bar where the
 reading is carried by the *shape* of the lit region as much as by its colour,
 so it survives greyscale and colour blindness — and so a low score literally
 emits less light than a high one.
 */

private enum Ticks {
    static let count = 28
    static let minHeight: CGFloat = 6
    static let maxHeight: CGFloat = 28
    /// Same 1.7 exponent as the JS `tickHeight`, so the ramps match.
    static let exponent: CGFloat = 1.7
}

struct RiskTickBar: View {
    let score: Int
    let tone: Tone
    /// The bar is the first thing to give up height when the family is short.
    var maxHeight: CGFloat = Ticks.maxHeight

    private var litTicks: Int {
        Int((CGFloat(score.clampedScore) / 100 * CGFloat(Ticks.count)).rounded())
    }

    private func height(at index: Int) -> CGFloat {
        let t = CGFloat(index) / CGFloat(Ticks.count - 1)
        let scale = maxHeight / Ticks.maxHeight
        return (Ticks.minHeight + (Ticks.maxHeight - Ticks.minHeight) * pow(t, Ticks.exponent)) * scale
    }

    var body: some View {
        // Ticks flex to fill whatever width the family gives us, matching the
        // `flex: 1` columns on the JS side — this is what keeps the bar aligned
        // to the text above it on every device width.
        HStack(alignment: .bottom, spacing: 2) {
            ForEach(0..<Ticks.count, id: \.self) { index in
                RoundedRectangle(cornerRadius: 1)
                    .fill(index < litTicks ? tone.base : Theme.border)
                    .frame(maxWidth: .infinity)
                    .frame(height: height(at: index))
            }
        }
        .frame(height: maxHeight, alignment: .bottom)
        .accessibilityHidden(true)
    }
}

/// Caption, number, word, and bar — the whole readout, sized for the family.
struct RiskReadout: View {
    let data: RiskData
    /// Small widgets stack the number over the word; medium sets them on a
    /// shared baseline to buy back vertical room for the quick actions.
    let stacked: Bool
    var tickHeight: CGFloat = Ticks.maxHeight

    var body: some View {
        VStack(alignment: .leading, spacing: Space.xs) {
            Text("Current risk".uppercased())
                .font(TypeScale.caption)
                .tracking(TypeScale.captionTracking)
                .foregroundStyle(Theme.inkFaint)

            if stacked {
                // Spacing 0: the 44pt line box already supplies the air, and a
                // grid step on top of it reads as two unrelated lines rather
                // than one reading.
                VStack(alignment: .leading, spacing: 0) {
                    scoreText
                    labelText
                }
            } else {
                HStack(alignment: .lastTextBaseline, spacing: Space.sm) {
                    scoreText
                    labelText
                }
            }

            Spacer(minLength: Space.xs)

            RiskTickBar(score: data.score, tone: data.tone, maxHeight: tickHeight)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            "Current risk: \(data.displayLabel), \(data.score.clampedScore) out of 100"
        )
    }

    private var scoreText: some View {
        Text("\(data.score.clampedScore)")
            .font(TypeScale.display)
            .tracking(TypeScale.displayTracking)
            .foregroundStyle(data.tone.base)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
    }

    private var labelText: some View {
        Text(data.displayLabel)
            .font(TypeScale.heading)
            .tracking(TypeScale.headingTracking)
            .foregroundStyle(Theme.inkMuted)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
    }
}

extension Int {
    /// The bridge writes whatever the risk store computed; the widget should
    /// not draw a 140-unit bar if that ever goes wrong.
    var clampedScore: Int { Swift.max(0, Swift.min(100, self)) }
}
