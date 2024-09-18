import React, { ReactNode, useMemo, useState } from "react";
import { ApprovalFlow } from "../../api/types/approval-flow";
import { Control, Controller, FieldValues } from "react-hook-form";
import {
  ApprovalFlowFilter,
  useLazyApprovalFlows,
} from "../../api/approval-flow.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import debounce from "lodash-es/debounce";

interface ApprovalFlowsSelectorProps<T> {
  selectedId?: string;
  selectedText?: string;
  onApprovalFlowUuidChange?: (unit: ApprovalFlow) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const ApprovalFlowsSelector = <T,>(props: ApprovalFlowsSelectorProps<T>) => {
  const {
    items: { results: approvalFlows },
    isLoading,
    isValidating,
    getApprovalFlows,
  } = useLazyApprovalFlows();
  const [inputValue, setInputValue] = useState("");

  const handleApprovalFlowSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getApprovalFlows({
          q: searchTerm,
          startIndex: 0,
          limit: 10,
        } as any as ApprovalFlowFilter);
      }, 300),
    [getApprovalFlows]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    handleApprovalFlowSearch(value);
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
          items={
            props.selectedId
              ? [
                  ...(approvalFlows?.some((x) => x.uuid === props.selectedId)
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          name: props.selectedText,
                        },
                      ]),
                  ...(approvalFlows ?? []),
                ]
              : approvalFlows || []
          }
          onChange={(data: { selectedItem: ApprovalFlow }) => {
            props.onApprovalFlowUuidChange?.(data.selectedItem);
            onChange(data.selectedItem.uuid);
          }}
          initialSelectedItem={
            props.selectedId
              ? approvalFlows?.find((p) => p.uuid === props.selectedId) ?? {
                  uuid: props.selectedId,
                  name: props.selectedText,
                }
              : null
          }
          itemToString={(item?: ApprovalFlow) =>
            item && item?.name ? `${item?.name}` : ""
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

export default ApprovalFlowsSelector;
