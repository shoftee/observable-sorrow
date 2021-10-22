import { System } from ".";

export class SectionsSystem extends System {
  update(): void {
    this.unlock();

    this.updateSociety();
  }

  private unlock() {
    for (const section of this.admin.sections()) {
      const unlockEffect = section.meta.unlockEffect;
      if (section.state.unlocked || unlockEffect === undefined) {
        continue;
      }

      const effect = this.admin.boolean(unlockEffect);
      section.state.unlocked = effect.state.value ?? false;
    }
  }

  private updateSociety() {
    const section = this.admin.section("society-section").state;
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
