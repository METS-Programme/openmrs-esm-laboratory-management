import React, { ReactNode, useEffect } from "react";
import { Concept } from "../../api/types/concept/concept";
import { useLazyConcept } from "../../api/concept.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";

interface ConceptMembersFilterSelectorProps<T> {
  conceptUuid?: string;
  concept?: Concept;
  selectedId?: string;
  selectedText?: string;
  onChange?: (unit: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  name: string;
  idSuffix?: string;
  excludeOptions?: string[];
  popUpDrirection?: string;
  className?: string;
  style?: any;
}

const ConceptMembersFilterSelector = <T,>(
  props: ConceptMembersFilterSelectorProps<T>
) => {
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
    <ComboBox
      style={props.style}
      className={props.className}
      titleText={props.title}
      name={props.name}
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
  );
};

export default ConceptMembersFilterSelector;
