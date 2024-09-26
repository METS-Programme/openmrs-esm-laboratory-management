import React, { ReactNode } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useTestConfigs } from "../../api/test-config.resource";
import { TestConfig } from "../../api/types/test-config";
import { formatTestName } from "../test-name";

interface TestsComboSelectorProps<T> {
  selectedId?: string;
  selectedText?: string;
  onChange?: (unit: TestConfig) => void;
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
  popUpDirection?: string;
  active?: boolean;
}

const TestsComboSelector = <T,>(props: TestsComboSelectorProps<T>) => {
  const {
    items: { results: testOptions },
    isLoading: isLoadingTestOptions,
  } = useTestConfigs({ active: props.active ?? true });

  if (isLoadingTestOptions) return <TextInputSkeleton />;

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
          direction={props.popUpDirection}
          size="md"
          items={
            props.selectedId
              ? [
                  ...(testOptions?.some((x) => x.testUuid === props.selectedId)
                    ? []
                    : [
                        {
                          testUuid: props.selectedId,
                          testName: props.selectedText,
                        },
                      ]),
                  ...(testOptions ?? []),
                ]
              : testOptions || []
          }
          onChange={(data: { selectedItem: TestConfig }) => {
            props.onChange?.(data?.selectedItem);
            onChange(data?.selectedItem?.testUuid); // Provide a default value if needed
          }}
          initialSelectedItem={
            props.selectedId
              ? testOptions?.find((p) => p.testUuid === props.selectedId) ?? {
                  testUuid: props.selectedId,
                  testName: props.selectedText,
                }
              : null
          }
          itemToString={(item?: TestConfig) =>
            item ? formatTestName(item.testName, item.testShortName) : ""
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

export default TestsComboSelector;
