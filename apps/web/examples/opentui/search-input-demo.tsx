import { SearchInput } from "@/registry/bases/opentui/ui/search-input";

export default function SearchInputDemo() {
  return (
    <SearchInput
      label="Search Packages"
      options={["react", "vue", "svelte", "angular", "solid"]}
      placeholder="Search..."
    />
  );
}
