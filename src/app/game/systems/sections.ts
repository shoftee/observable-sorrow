import { System } from ".";

export class SectionsSystem extends System {
  update(): void {
    this.updateSociety();
  }

  private updateSociety() {
    const section = this.admin.section("society").state;
    const society = this.admin.society().state;

    section.label = this.societyLabel(society.totalPops);
    section.alert = this.societyAlert(society.idlePops);
  }

  private societyLabel(totalPops: number): string {
    switch (true) {
      case totalPops === 0:
        return "sections.society.outpost";
      case totalPops < 5:
        return "sections.society.small-village";
      default:
        return "sections.society.village";
    }
  }

  private societyAlert(idlePops: number): string | undefined {
    switch (true) {
      case idlePops === 0:
        return undefined;
      case idlePops < 100:
        return idlePops.toFixed(0);
      default:
        return "99+";
    }
  }
}
