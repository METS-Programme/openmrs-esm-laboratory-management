import React, { ReactNode, useMemo, useState } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, InlineLoading, TextInputSkeleton } from "@carbon/react";
import debounce from "lodash-es/debounce";
import {
  useLazyUsers,
  UserFilterCriteria,
  otherUser,
} from "../../api/users.resource";
import { User } from "../../api/types/user";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";

interface UsersSelectorProps<T> {
  placeholder?: string;
  selectedId?: string;
  selectedText?: string;
  onUserChanged?: (user: User) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const UsersSelector = <T,>(props: UsersSelectorProps<T>) => {
  const {
    items: { results: users },
    isLoading,
    isValidating,
    getUsers,
  } = useLazyUsers();
  const [inputValue, setInputValue] = useState("");

  const handleConceptSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getUsers({
          v: ResourceRepresentation.Default,
          q: searchTerm,
          startIndex: 0,
          limit: 10,
        } as any as UserFilterCriteria);
      }, 300),
    [getUsers]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    handleConceptSearch(value);
  };

  const userOptions = [...(users ?? []), otherUser];

  if (isLoading) return <TextInputSkeleton />;

  return (
    <div>
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
                    ...(userOptions?.some((x) => x.uuid === props.selectedId)
                      ? []
                      : [
                          {
                            uuid: props.selectedId,
                            display: props.selectedText,
                          },
                        ]),
                    ...(userOptions ?? []),
                  ]
                : userOptions || []
            }
            onChange={(data: { selectedItem: User }) => {
              props.onUserChanged?.(data.selectedItem);
              onChange(data.selectedItem?.uuid);
            }}
            initialSelectedItem={
              props.selectedId
                ? userOptions?.find((p) => p.uuid === props.selectedId) ?? {
                    uuid: props.selectedId,
                    display: props.selectedText,
                  }
                : null
            }
            itemToString={(item?: User) =>
              `${item?.person?.display ?? item?.display ?? ""}`
            }
            shouldFilterItem={() => true}
            onInputChange={handleInputChange}
            placeholder={props.placeholder}
            inputValue={inputValue}
            invalid={props.invalid}
            invalidText={props.invalidText}
            ref={ref}
          />
        )}
      />
      {isValidating && (
        <InlineLoading
          status="active"
          iconDescription="Searching"
          description="Searching..."
        />
      )}
    </div>
  );
};

export default UsersSelector;
