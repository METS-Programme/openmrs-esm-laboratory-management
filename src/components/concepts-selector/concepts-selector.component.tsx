import React, { ReactNode, useMemo, useState } from "react";
import { Concept } from "../../api/types/concept/concept";
import { Control, Controller, FieldValues } from "react-hook-form";
import {
  ConceptFilterCriteria,
  useLazyConcepts,
} from "../../api/concept.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import debounce from "lodash-es/debounce";

interface ConceptsSelectorProps<T> {
  conceptUuid?: string;
  onConceptUuidChange?: (unit: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const ConceptsSelector = <T,>(props: ConceptsSelectorProps<T>) => {
  const {
    items: { results: concepts },
    isLoading,
    isValidating,
    getConcepts,
  } = useLazyConcepts();
  const [inputValue, setInputValue] = useState("");

  const handleConceptSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getConcepts({
          q: searchTerm,
          startIndex: 0,
          limit: 10,
        } as any as ConceptFilterCriteria);
      }, 300),
    [getConcepts]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    handleConceptSearch(value);
  };

  if (isLoading) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, ref } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={props.name}
          size={"md"}
          items={concepts ?? []}
          onChange={(data: { selectedItem: Concept }) => {
            props.onConceptUuidChange?.(data.selectedItem);
            onChange(data.selectedItem?.uuid);
          }}
          initialSelectedItem={
            concepts?.find((p) => p.uuid === props.conceptUuid) || {}
          }
          itemToString={(item?: Concept) =>
            item && item?.display ? `${item?.display}` : ""
          }
          shouldFilterItem={() => true}
          onInputChange={(event) => handleInputChange(event)}
          inputValue={inputValue}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default ConceptsSelector;
