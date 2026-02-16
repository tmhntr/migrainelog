import ExpoModulesCore
import WidgetKit

public class WidgetBridgeModule: Module {
  static let appGroupId = "group.dev.tmhntr.migrainelog"

  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    Function("setWidgetData") { (data: [String: Any]) in
      guard let defaults = UserDefaults(suiteName: WidgetBridgeModule.appGroupId) else {
        return
      }

      if let score = data["riskScore"] as? Double {
        defaults.set(Int(score), forKey: "riskScore")
      }
      if let label = data["riskLabel"] as? String {
        defaults.set(label, forKey: "riskLabel")
      }
      if let triggerCount = data["triggerCount24h"] as? Double {
        defaults.set(Int(triggerCount), forKey: "triggerCount24h")
      }
      if let episodeCount = data["episodeCount7d"] as? Double {
        defaults.set(Int(episodeCount), forKey: "episodeCount7d")
      }
      if let lastUpdated = data["lastUpdated"] as? String {
        defaults.set(lastUpdated, forKey: "lastUpdated")
      }

      defaults.synchronize()

      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
