module {
  public type Stats = {
    total : Nat;
    completed : Nat;
    pending : Nat;
    inProgress : Nat;
    avgScore : Nat;
  };

  public type DepartmentStat = {
    department : Text;
    avgScore : Nat;
    count : Nat;
  };
};
