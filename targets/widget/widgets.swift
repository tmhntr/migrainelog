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

    var color: Color {
        switch label {
        case "critical": return .red
        case "high": return .orange
        case "moderate": return .yellow
        default: return .green
        }
    }

    var displayLabel: String {
        label.prefix(1).uppercased() + label.dropFirst()
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

// MARK: - Views

struct RiskGaugeView: View {
    let data: RiskData

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 6)
                    .frame(width: 60, height: 60)

                Circle()
                    .trim(from: 0, to: CGFloat(data.score) / 100.0)
                    .stroke(data.color, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .frame(width: 60, height: 60)
                    .rotationEffect(.degrees(-90))

                Text("\(data.score)")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(data.color)
            }

            Text(data.displayLabel)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(data.color)
        }
    }
}

struct QuickActionButton: View {
    let icon: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.white)
                .frame(width: 32, height: 32)
                .background(color)
                .clipShape(RoundedRectangle(cornerRadius: 8))

            Text(label)
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(.secondary)
                .lineLimit(1)
        }
    }
}

// MARK: - Small Widget

struct MigraineWidgetSmallView: View {
    let entry: RiskEntry

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text("Migraine Risk")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)
                Spacer()
            }

            RiskGaugeView(data: entry.data)

            Spacer(minLength: 0)
        }
        .padding(4)
        .widgetURL(URL(string: "migrainelog://dashboard"))
    }
}

// MARK: - Medium Widget

struct MigraineWidgetMediumView: View {
    let entry: RiskEntry

    var body: some View {
        HStack(spacing: 16) {
            // Left side: Risk gauge
            VStack(spacing: 4) {
                Text("Migraine Risk")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)

                RiskGaugeView(data: entry.data)

                Spacer(minLength: 0)
            }

            Divider()

            // Right side: Quick actions
            VStack(spacing: 8) {
                Text("Quick Add")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)

                HStack(spacing: 12) {
                    Link(destination: URL(string: "migrainelog://add/trigger")!) {
                        QuickActionButton(
                            icon: "bolt.fill",
                            label: "Trigger",
                            color: .orange
                        )
                    }

                    Link(destination: URL(string: "migrainelog://add/episode")!) {
                        QuickActionButton(
                            icon: "brain.head.profile",
                            label: "Episode",
                            color: .red
                        )
                    }

                    Link(destination: URL(string: "migrainelog://add/treatment")!) {
                        QuickActionButton(
                            icon: "cross.case.fill",
                            label: "Treatment",
                            color: .blue
                        )
                    }
                }

                Spacer(minLength: 0)
            }
        }
        .padding(4)
    }
}

// MARK: - Widget Configuration

struct MigraineWidget: Widget {
    let kind: String = "MigraineRiskWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RiskTimelineProvider()) { entry in
            if #available(iOS 17.0, *) {
                MigraineWidgetContainerView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                MigraineWidgetContainerView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("Migraine Risk")
        .description("View your current migraine risk level and quickly log events.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct MigraineWidgetContainerView: View {
    @Environment(\.widgetFamily) var widgetFamily
    let entry: RiskEntry

    var body: some View {
        switch widgetFamily {
        case .systemMedium:
            MigraineWidgetMediumView(entry: entry)
        default:
            MigraineWidgetSmallView(entry: entry)
        }
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    MigraineWidget()
} timeline: {
    RiskEntry(date: .now, data: RiskData(score: 35, label: "moderate", triggerCount24h: 2, episodeCount7d: 1, lastUpdated: ""))
    RiskEntry(date: .now, data: RiskData(score: 72, label: "high", triggerCount24h: 4, episodeCount7d: 3, lastUpdated: ""))
}

#Preview(as: .systemMedium) {
    MigraineWidget()
} timeline: {
    RiskEntry(date: .now, data: RiskData(score: 35, label: "moderate", triggerCount24h: 2, episodeCount7d: 1, lastUpdated: ""))
    RiskEntry(date: .now, data: RiskData(score: 72, label: "high", triggerCount24h: 4, episodeCount7d: 3, lastUpdated: ""))
}
