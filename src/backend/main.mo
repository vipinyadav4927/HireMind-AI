import AdminTypes "types/admin";
import CandidateTypes "types/candidates";
import InterviewTypes "types/interviews";
import Map "mo:core/Map";

import AdminApi "mixins/admin-api";
import CandidatesApi "mixins/candidates-api";
import InterviewsApi "mixins/interviews-api";
import StatsApi "mixins/stats-api";

actor {
  // Admin state
  let admins = Map.empty<Text, AdminTypes.Admin>();
  let adminSessions = Map.empty<Text, Text>();

  // Candidate state
  let candidates = Map.empty<Text, CandidateTypes.Candidate>();
  let candidateTokens = Map.empty<Text, Text>();           // interview link token -> email
  let candidatePasscodes = Map.empty<Text, AdminTypes.Admin>(); // email -> {email, passwordHash=passcode}
  let candidateSessions = Map.empty<Text, Text>();          // session token -> email

  // Interview state
  let interviewSessions = Map.empty<Text, InterviewTypes.InterviewSession>();

  include AdminApi(admins, adminSessions);
  include CandidatesApi(candidates, candidateTokens, candidatePasscodes, candidateSessions);
  include InterviewsApi(interviewSessions, candidates);
  include StatsApi(candidates);
};
