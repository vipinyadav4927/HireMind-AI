import CandidateTypes "../types/candidates";
import StatsTypes "../types/stats";
import StatsLib "../lib/StatsLib";
import Map "mo:core/Map";

mixin (
  candidates : Map.Map<Text, CandidateTypes.Candidate>,
) {
  public func getStats() : async StatsTypes.Stats {
    StatsLib.getStats(candidates)
  };

  public func getDepartmentStats() : async [StatsTypes.DepartmentStat] {
    StatsLib.getDepartmentStats(candidates)
  };
};
