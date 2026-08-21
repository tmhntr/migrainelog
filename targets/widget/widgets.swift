import WidgetKit
import SwiftUI

// MARK: - Data Model

struct RiskData {
    let score: Int
    let label: String
    let triggerCount24h: Int
    let episodeCount7d: Int
    let lastUpdated: String

    static let placeholder = RiskData(
        score: 0,
        label: "low",
        triggerCount24h: 0,
        episodeCount7d: 0,
        lastUpdated: ""
    )

    static func load() -> RiskData {
        guard let defaults = UserDefaults(suiteName: "group.dev.tmhntr.migrainelog") else {
            return .placeholder
        }

        return RiskData(
            score: defaults.integer(forKey: "riskScore"),
            label: defaults.string(forKey: "riskLabel") ?? "low",
            triggerCount24h: defaults.integer(forKey: "triggerCount24h"),
            episodeCount7d: defaults.integer(forKey: "episodeCount7d"),
            lastUpdated: defaults.string(forKey: "lastUpdated") ?? ""
        )
    }

    /// The four-step ramp from `palette.ts`, not the stock system colours.
    var tone: Tone {
        switch label {
        case "critical": return Theme.riskCritical
        case "high": return Theme.riskHigh
        case "moderate": return Theme.riskModerate
        default: return Theme.riskLow
        }
    }

    /// Matches `LABEL_TEXT` in `RiskGauge.tsx`. Note that `high` reads
    /// "Elevated" and `critical` reads "High" — the widget used to title-case
    /// the raw key, so it disagreed with the app about what the top two rungs
    /// are called.
    var displayLabel: String {
        switch label {
        case "critical": return "High"
        case "high": return "Elevated"
        case "moderate": return "Moderate"
        default: return "Low"
        }
    }

}

// MARK: - Timeline

struct RiskEntry: TimelineEntry {
    let date: Date
    let data: RiskData
}

struct RiskTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> RiskEntry {
        RiskEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (RiskEntry) -> Void) {
        let entry = RiskEntry(date: Date(), data: RiskData.load())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<RiskEntry>) -> Void) {
        let entry = RiskEntry(date: Date(), data: RiskData.load())
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Quick actions

/// The three loggable event types, in the order the app's `QuickLogButton`
/// renders them, with the same glyphs and the same per-type colours.
enum QuickAction: CaseIterable {
    case trigger, episode, treatment

    var label: String {
        switch self {
        case .trigger: return "Trigger"
        case .episode: return "Episode"
        case .treatment: return "Treatment"
        }
    }

    var icon: MaterialIcon {
        switch self {
        case .trigger: return .trigger
        case .episode: return .episode
        case .treatment: return .treatment
        }
    }

    var tone: Tone {
        switch self {
        case .trigger: return Theme.eventTrigger
        case .episode: return Theme.eventEpisode
        case .treatment: return Theme.eventTreatment
        }
    }

    /// Matches the `linking` config in `App.tsx`.
    var url: URL {
        switch self {
        case .trigger: return URL(string: "migrainelog://add/trigger")!
        case .episode: return URL(string: "migrainelog://add/episode")!
        case .treatment: return URL(string: "migrainelog://add/treatment")!
        }
    }
}

/**
 A quick-add row: tinted glyph tile, then the label, on a hairline-bordered
 surface. The old version stacked a white-on-saturated-colour glyph over a tiny
 9pt caption — three loud chips that fought the risk reading for attention and
 sat below the legible-size floor. This is the app's card treatment instead:
 surface, hairline, colour carried by a soft tint rather than a solid block.
 */
struct QuickActionRow: View {
    let action: QuickAction

    var body: some View {
        Link(destination: action.url) {
            HStack(spacing: Space.sm) {
                MaterialIconView(action.icon, size: 18, color: action.tone.base)
                    .frame(width: 26, height: 26)
                    .background(action.tone.soft, in: RoundedRectangle(cornerRadius: Radius.sm))

                Text(action.label)
                    .font(TypeScale.label)
                    .foregroundStyle(Theme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Spacer(minLength: 0)
            }
            .padding(.horizontal, Space.sm)
            .padding(.vertical, Space.xs)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .background(Theme.surface, in: RoundedRectangle(cornerRadius: Radius.md))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.md)
                    .strokeBorder(Theme.border, lineWidth: BorderWidth.hairline)
            )
        }
        .accessibilityLabel("Log \(action.label.lowercased())")
    }
}

/**
 The two recent counts, each led by its event glyph.

 Spelling the counts out ("12 triggers · 24h   11 episodes · 7d") needs about
 230pt and the left column has ~175pt, so it truncated as soon as either count
 reached two digits. The glyph carries the noun instead — the same triangle and
 dot field the app uses — which fits, colour-codes the pair, and keeps the
 window labels that make the numbers mean anything.

 The counts were being read from the app group and never displayed before this.
 */
struct RecentCounts: View {
    let data: RiskData

    var body: some View {
        HStack(spacing: Space.md) {
            item(.trigger, value: data.triggerCount24h, window: "24h",
                 accessibility: "\(pluralised(data.triggerCount24h, "trigger")) in the last 24 hours")
            item(.episode, value: data.episodeCount7d, window: "7d",
                 accessibility: "\(pluralised(data.episodeCount7d, "episode")) in the last 7 days")
            Spacer(minLength: 0)
        }
    }

    /// The glyph carries the noun visually, but VoiceOver has to say it.
    private func pluralised(_ count: Int, _ noun: String) -> String {
        "\(count) \(noun)\(count == 1 ? "" : "s")"
    }

    private func item(
        _ action: QuickAction,
        value: Int,
        window: String,
        accessibility: String
    ) -> some View {
        HStack(spacing: Space.xs) {
            MaterialIconView(action.icon, size: 13, color: action.tone.base)

            Text("\(value) · \(window)")
                .font(TypeScale.data)
                .foregroundStyle(Theme.inkMuted)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibility)
    }
}

/// Small caption used to head each column, so the two halves of the medium
/// layout start on the same optical line.
struct ColumnHeading: View {
    let text: String

    var body: some View {
        Text(text.uppercased())
            .font(TypeScale.caption)
            .tracking(TypeScale.captionTracking)
            .foregroundStyle(Theme.inkFaint)
    }
}

// MARK: - Small Widget

/**
 155–170pt square, minus the system's ~16pt content margins, leaves roughly
 123pt of height. That budget is why the small family shows the reading and
 nothing else: caption, score, word, bar. Anything more would have to shrink the
 number, which is the one thing the widget exists to show.
 */
struct MigraineWidgetSmallView: View {
    let entry: RiskEntry

    var body: some View {
        RiskReadout(data: entry.data, stacked: true, tickHeight: 18)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .widgetURL(URL(string: "migrainelog://dashboard"))
    }
}

// MARK: - Medium Widget

/**
 Two columns on a shared top baseline: the reading on the left, quick actions on
 the right. The right column is width-clamped rather than proportional so
 "Treatment" never wraps, and the left column takes the remainder — which is
 what lets the number and the word sit on one baseline here but not in the
 small family.
 */
struct MigraineWidgetMediumView: View {
    let entry: RiskEntry

    private let actionColumnWidth: CGFloat = 118

    var body: some View {
        HStack(alignment: .top, spacing: Space.md) {
            VStack(alignment: .leading, spacing: Space.xs) {
                RiskReadout(data: entry.data, stacked: false, tickHeight: 22)

                RecentCounts(data: entry.data)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Rectangle()
                .fill(Theme.border)
                .frame(width: BorderWidth.hairline)
                .frame(maxHeight: .infinity)

            VStack(alignment: .leading, spacing: Space.xs) {
                ColumnHeading(text: "Quick add")

                // Equal-height rows: the stack divides the remaining space, so
                // the three tiles stay aligned across device sizes instead of
                // being pinned to a hardcoded height.
                ForEach(QuickAction.allCases, id: \.self) { action in
                    QuickActionRow(action: action)
                }
            }
            .frame(width: actionColumnWidth, alignment: .leading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .widgetURL(URL(string: "migrainelog://dashboard"))
    }
}

// MARK: - Widget Configuration

struct MigraineWidget: Widget {
    let kind: String = "MigraineRiskWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RiskTimelineProvider()) { entry in
            if #available(iOS 17.0, *) {
                MigraineWidgetContainerView(entry: entry)
                    // The app's warm paper / near-black grounds rather than
                    // `.fill.tertiary`: no pure white, no pure black.
                    .containerBackground(Theme.background, for: .widget)
            } else {
                MigraineWidgetContainerView(entry: entry)
                    .padding(Space.lg)
                    .background(Theme.background)
            }
        }
        .configurationDisplayName("Migraine Risk")
        .description("View your current migraine risk level and quickly log events.")
        .supportedFamilies([.systemSmall, .systemMedium])
        // Take over the container margins so every family insets by exactly
        // one `Space.lg`, applied once in the container view below. The old
        // `.padding(4)` sat inside the system margins and compounded with them,
        // which is why the two families used to inset by different amounts.
        .contentMarginsDisabled()
    }
}

struct MigraineWidgetContainerView: View {
    @Environment(\.widgetFamily) var widgetFamily
    let entry: RiskEntry

    var body: some View {
        Group {
            switch widgetFamily {
            case .systemMedium:
                MigraineWidgetMediumView(entry: entry)
            default:
                MigraineWidgetSmallView(entry: entry)
            }
        }
        .padding(Space.lg)
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    MigraineWidget()
} timeline: {
    RiskEntry(date: .now, data: RiskData(score: 8, label: "low", triggerCount24h: 0, episodeCount7d: 0, lastUpdated: ""))
    RiskEntry(date: .now, data: RiskData(score: 35, label: "moderate", triggerCount24h: 2, episodeCount7d: 1, lastUpdated: ""))
    RiskEntry(date: .now, data: RiskData(score: 72, label: "high", triggerCount24h: 4, episodeCount7d: 3, lastUpdated: ""))
    RiskEntry(date: .now, data: RiskData(score: 100, label: "critical", triggerCount24h: 12, episodeCount7d: 11, lastUpdated: ""))
}

#Preview(as: .systemMedium) {
    MigraineWidget()
} timeline: {
    RiskEntry(date: .now, data: RiskData(score: 8, label: "low", triggerCount24h: 0, episodeCount7d: 0, lastUpdated: ""))
    RiskEntry(date: .now, data: RiskData(score: 35, label: "moderate", triggerCount24h: 2, episodeCount7d: 1, lastUpdated: ""))
    RiskEntry(date: .now, data: RiskData(score: 72, label: "high", triggerCount24h: 4, episodeCount7d: 3, lastUpdated: ""))
    RiskEntry(date: .now, data: RiskData(score: 100, label: "critical", triggerCount24h: 12, episodeCount7d: 11, lastUpdated: ""))
}
