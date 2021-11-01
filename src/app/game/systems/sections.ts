import { watchSyncEffect } from "vue";
import { System } from ".";

export class SectionsSystem extends System {
  init(): void {
    watchSyncEffect(() => {
      const pops = this.admin.pops();

      const section = this.admin.section("society").state;
      section.label = this.societyLabel(pops.size);
      section.alert = this.societyAlert(pops.withJob(undefined).count());
    });
  }

  update(): void {
    // sections are fully reactive
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
