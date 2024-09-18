import React, { ReactNode } from "react";
import { Concept } from "../../api/types/concept/concept";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useConcept } from "../../api/concept.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { ApprovalConfig } from "../../api/types/approval-config";
import { useApprovalConfigs } from "../../api/approval-config.resource";

interface ApprovalConfigurationsSelectorProps<T> {
  selectedId?: string;
  selectedText?: string;
  onChange?: (unit: ApprovalConfig) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  idSuffix?: string;
}

const ApprovalConfigurationsSelector = <T,>(
  props: ApprovalConfigurationsSelectorProps<T>
) => {
  const {
    items: { results: approvalConfigurations },
    isLoading,
  } = useApprovalConfigs({});

  if (isLoading) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={`${props.name}-${props.idSuffix}`}
          size="md"
          items={
            props.selectedId
              ? [
                  ...(approvalConfigurations?.some(
                    (x) => x.uuid === props.selectedId
                  )
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          approvalTitle: props.selectedText,
                        },
                      ]),
                  ...(approvalConfigurations ?? []),
                ]
              : approvalConfigurations || []
          }
          onChange={(data: { selectedItem: ApprovalConfig }) => {
            props.onChange?.(data?.selectedItem);
            onChange(data?.selectedItem?.uuid); // Provide a default value if needed
          }}
          initialSelectedItem={
            props.selectedId
              ? approvalConfigurations?.find(
                  (p) => p.uuid === props.selectedId
                ) ?? {
                  uuid: props.selectedId,
                  approvalTitle: props.selectedText,
                }
              : null
          }
          itemToString={(item?: ApprovalConfig) =>
            item && item?.approvalTitle ? `${item?.approvalTitle}` : ""
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

export default ApprovalConfigurationsSelector;
