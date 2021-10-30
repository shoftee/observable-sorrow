import { System } from ".";

export class SectionsSystem extends System {
  update(): void {
    this.updateSociety();
  }

  private updateSociety() {
    const pops = this.admin.pops();

    const section = this.admin.section("society").state;
    section.label = this.societyLabel(pops.size);
    section.alert = this.societyAlert(pops.withJob(undefined).count());
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
