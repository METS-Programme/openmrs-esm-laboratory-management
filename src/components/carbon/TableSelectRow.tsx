/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";
import React from "react";
import classNames from "classnames";
import { Checkbox } from "@carbon/react";

export interface TableSelectRowProps {
  /**
   * Specify a label to be read by screen readers on the containing textbox
   * node
   */
  ["aria-label"]?: string;

  /**
   * Specify whether this row is selected, or not
   */
  checked: boolean;

  /**
   * The CSS class names of the cell that wraps the underlying input control
   */
  className?: string;

  /**
   * Specify whether the control is disabled
   */
  disabled?: boolean;

  /**
   * Provide an `id` for the underlying input control
   */
  id: string;

  /**
   * Provide a `name` for the underlying input control
   */
  name: string;

  /**
   * Provide an optional hook that is called each time the input is updated
   */
  onChange?: (
    evt: React.ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ) => void;

  /**
   * Provide a handler to listen to when a user initiates a selection request
   */
  onSelect: React.MouseEventHandler<HTMLInputElement>;

  /**
   * Specify whether the control should be a radio button or inline checkbox
   */
  radio?: boolean;

  /**
   * Specify whether the selection only has a subset of all items
   */
  indeterminate?: boolean;
}

const TableSelectRow = ({
  checked,
  id,
  name,
  onSelect,
  onChange,
  disabled,
  radio,
  className,
  indeterminate,
}: TableSelectRowProps) => {
  const selectionInputProps = {
    id,
    name,
    onClick: onSelect,
    onChange,
    checked,
    disabled,
    indeterminate,
  };
  const InlineInputComponent = Checkbox;
  const tableSelectRowClasses = classNames(`cds--table-column-checkbox`, {
    ...(className && { [className]: true }),
    [`cds--table-column-radio`]: radio,
  });
  return (
    <td className={tableSelectRowClasses} aria-live="off">
      <InlineInputComponent {...selectionInputProps} />
    </td>
  );
};
TableSelectRow.propTypes = {
  /**
   * Specify whether this row is selected, or not
   */
  checked: PropTypes.bool.isRequired,

  /**
   * The CSS class names of the cell that wraps the underlying input control
   */
  className: PropTypes.string,

  /**
   * Specify whether the control is disabled
   */
  disabled: PropTypes.bool,

  /**
   * Provide an `id` for the underlying input control
   */
  id: PropTypes.string.isRequired,

  /**
   * Provide a `name` for the underlying input control
   */
  name: PropTypes.string.isRequired,

  /**
   * Provide an optional hook that is called each time the input is updated
   */
  onChange: PropTypes.func,

  /**
   * Provide a handler to listen to when a user initiates a selection request
   */
  onSelect: PropTypes.func.isRequired,

  /**
   * Specify whether the control should be a radio button or inline checkbox
   */
  radio: PropTypes.bool,

  /**
   * Specify whether the selection only has a subset of all items
   */
  indeterminate: PropTypes.bool,
};

export default TableSelectRow;
