import { Text } from "ink";

import { Grid } from "@/registry/bases/ink/ui/grid";

export default function GridDemo() {
  return (
    <Grid columns={3} gap={1}>
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
      <Text>D</Text>
      <Text>E</Text>
      <Text>F</Text>
    </Grid>
  );
}
