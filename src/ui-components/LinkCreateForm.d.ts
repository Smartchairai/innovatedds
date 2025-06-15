/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type LinkCreateFormInputValues = {
    title?: string;
    url?: string;
    description?: string;
    category?: string;
    approved?: boolean;
};
export declare type LinkCreateFormValidationValues = {
    title?: ValidationFunction<string>;
    url?: ValidationFunction<string>;
    description?: ValidationFunction<string>;
    category?: ValidationFunction<string>;
    approved?: ValidationFunction<boolean>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type LinkCreateFormOverridesProps = {
    LinkCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    title?: PrimitiveOverrideProps<TextFieldProps>;
    url?: PrimitiveOverrideProps<TextFieldProps>;
    description?: PrimitiveOverrideProps<TextFieldProps>;
    category?: PrimitiveOverrideProps<TextFieldProps>;
    approved?: PrimitiveOverrideProps<SwitchFieldProps>;
} & EscapeHatchProps;
export declare type LinkCreateFormProps = React.PropsWithChildren<{
    overrides?: LinkCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: LinkCreateFormInputValues) => LinkCreateFormInputValues;
    onSuccess?: (fields: LinkCreateFormInputValues) => void;
    onError?: (fields: LinkCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: LinkCreateFormInputValues) => LinkCreateFormInputValues;
    onValidate?: LinkCreateFormValidationValues;
} & React.CSSProperties>;
export default function LinkCreateForm(props: LinkCreateFormProps): React.ReactElement;
