import React, { ReactNode } from "react";
import { Provider } from "../../api/types/provider";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useProviders } from "../../api/provider.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";

interface ProviderSelectorProps<T> {
  className?: string;
  selectedId?: string;
  selectedText?: string;
  onChange?: (unit: Provider) => void;
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

const ProviderSelector = <T,>(props: ProviderSelectorProps<T>) => {
  const {
    items: { results: providerOptions },
    isLoading,
  } = useProviders({});

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
                  ...(providerOptions?.some((x) => x.uuid === props.selectedId)
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          display: props.selectedText,
                        },
                      ]),
                  ...(providerOptions ?? []),
                ]
              : providerOptions || []
          }
          onChange={(data: { selectedItem: Provider }) => {
            props.onChange?.(data?.selectedItem);
            onChange(data?.selectedItem?.uuid);
          }}
          initialSelectedItem={
            props.selectedId
              ? providerOptions?.find((p) => p.uuid === props.selectedId) ?? {
                  uuid: props.selectedId,
                  display: props.selectedText,
                }
              : null
          }
          itemToString={(item?: Provider) =>
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

export default ProviderSelector;
