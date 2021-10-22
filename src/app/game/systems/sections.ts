import { System } from ".";

export class SectionsSystem extends System {
  update(): void {
    this.updateSociety();
    this.updateScience();
  }

  private updateSociety() {
    const section = this.admin.section("society-section").state;
    const society = this.admin.society().state;

    section.label = this.societyLabel(society.totalPops);
    section.alert = this.societyAlert(society.idlePops);

    if (!section.unlocked) {
      const kittens = this.admin.resource("kittens").state;
      if (kittens.capacity && kittens.capacity > 0) {
        section.unlocked = true;
        society.unlockedJobs.add("woodcutter");
      }
    }
  }

  private updateScience() {
    const section = this.admin.section("science-section").state;
    if (!section.unlocked) {
      const library = this.admin.building("library").state;
      if (library.level > 0) {
        section.unlocked = true;
      }
    }
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
