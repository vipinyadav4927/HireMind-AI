import CandidateTypes "../types/candidates";
import StatsTypes "../types/stats";
import Map "mo:core/Map";

module {
  public type Candidate = CandidateTypes.Candidate;
  public type Stats = StatsTypes.Stats;
  public type DepartmentStat = StatsTypes.DepartmentStat;

  public func getStats(candidates : Map.Map<Text, Candidate>) : Stats {
    var total : Nat = 0;
    var completed : Nat = 0;
    var pending : Nat = 0;
    var inProgress : Nat = 0;
    var scoreSum : Nat = 0;
    var scoreCount : Nat = 0;

    for ((_, c) in candidates.entries()) {
      total += 1;
      if (c.status == "Completed") {
        completed += 1;
        switch (c.score) {
          case (?s) {
            scoreSum += s;
            scoreCount += 1;
          };
          case null {};
        };
      } else if (c.status == "In Progress") {
        inProgress += 1;
      } else {
        pending += 1;
      };
    };

    let avgScore = if (scoreCount > 0) scoreSum / scoreCount else 0;

    { total; completed; pending; inProgress; avgScore }
  };

  public func getDepartmentStats(candidates : Map.Map<Text, Candidate>) : [DepartmentStat] {
    // Collect per-department counts and scores
    let deptCount = Map.empty<Text, Nat>();
    let deptScoreSum = Map.empty<Text, Nat>();
    let deptScoreCount = Map.empty<Text, Nat>();

    for ((_, c) in candidates.entries()) {
      let dept = c.department;
      let prevCount = switch (deptCount.get(dept)) {
        case (?n) n;
        case null 0;
      };
      deptCount.add(dept, prevCount + 1);

      if (c.status == "Completed") {
        switch (c.score) {
          case (?s) {
            let prevSum = switch (deptScoreSum.get(dept)) {
              case (?n) n;
              case null 0;
            };
            let prevCnt = switch (deptScoreCount.get(dept)) {
              case (?n) n;
              case null 0;
            };
            deptScoreSum.add(dept, prevSum + s);
            deptScoreCount.add(dept, prevCnt + 1);
          };
          case null {};
        };
      };
    };

    let results = Map.empty<Text, DepartmentStat>();
    for ((dept, count) in deptCount.entries()) {
      let scoreSum = switch (deptScoreSum.get(dept)) {
        case (?n) n;
        case null 0;
      };
      let scoreCnt = switch (deptScoreCount.get(dept)) {
        case (?n) n;
        case null 0;
      };
      let avgScore = if (scoreCnt > 0) scoreSum / scoreCnt else 0;
      results.add(dept, { department = dept; count; avgScore });
    };

    results.values().toArray()
  };
};
