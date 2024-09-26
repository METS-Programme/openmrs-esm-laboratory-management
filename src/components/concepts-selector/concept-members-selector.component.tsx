import React, { ReactNode, useEffect } from "react";
import { Concept } from "../../api/types/concept/concept";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useLazyConcept } from "../../api/concept.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";

interface ConceptMembersSelectorProps<T> {
  conceptUuid?: string;
  concept?: Concept;
  selectedId?: string;
  selectedText?: string;
  onChange?: (unit: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  idSuffix?: string;
  excludeOptions?: string[];
  popUpDrirection?: string;
  className?: string;
}

const ConceptMembersSelector = <T,>(props: ConceptMembersSelectorProps<T>) => {
  const {
    items: { answers: conceptAnswers, setMembers: conceptSetMembrs },
    getConcept,
    isLoading,
  } = useLazyConcept();

  useEffect(() => {
    if (!props.concept && props.conceptUuid) {
      getConcept(props.conceptUuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    isLoading ||
    (!props.concept &&
      props.conceptUuid &&
      !conceptAnswers &&
      !conceptSetMembrs) ||
    (!props.concept && !props.conceptUuid)
  )
    return <TextInputSkeleton />;

  const conceptOptions = (
    (props.concept
      ? props.concept?.answers && props.concept?.answers?.length > 0
        ? props.concept?.answers
        : props.concept?.setMembers
      : conceptAnswers && conceptAnswers?.length > 0
      ? conceptAnswers
      : conceptSetMembrs) ?? []
  ).filter(
    (p) => !props.excludeOptions || !props.excludeOptions.includes(p.uuid)
  );

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange } }) => (
        <ComboBox
          className={props.className}
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={`${props.name}-${props.idSuffix}`}
          direction={props.popUpDrirection}
          size="md"
          items={
            props.selectedId
              ? [
                  ...(conceptOptions?.some((x) => x.uuid === props.selectedId)
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          display: props.selectedText,
                        },
                      ]),
                  ...(conceptOptions ?? []),
                ]
              : conceptOptions || []
          }
          onChange={(data: { selectedItem: Concept }) => {
            props.onChange?.(data?.selectedItem);
            onChange(data?.selectedItem?.uuid); // Provide a default value if needed
          }}
          initialSelectedItem={
            props.selectedId
              ? conceptOptions?.find((p) => p.uuid === props.selectedId) ?? {
                  uuid: props.selectedId,
                  display: props.selectedText,
                }
              : null
          }
          itemToString={(item?: Concept) =>
            item && item?.display ? `${item?.display}` : ""
          }
          shouldFilterItem={() => true}
          placeholder={props.placeholder}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default ConceptMembersSelector;
