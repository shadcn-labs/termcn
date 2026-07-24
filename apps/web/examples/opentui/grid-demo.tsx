import { Grid } from "@/registry/bases/opentui/ui/grid";

export default function GridDemo() {
  return (
    <Grid columns={3} gap={1}>
      <text>A</text>
      <text>B</text>
      <text>C</text>
      <text>D</text>
      <text>E</text>
      <text>F</text>
    </Grid>
  );
}
