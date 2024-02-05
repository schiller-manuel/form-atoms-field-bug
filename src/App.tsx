import {
  listField,
  textField,
  List,
  FieldLabel,
  useHydrateField,
  AddButtonProps,
  RemoveButtonProps,
} from "@form-atoms/field";
import { deepEqual } from "@tanstack/react-router";
import {
  formAtom,
  useFormActions,
  useFormState,
  useFieldInitialValue,
  InputField,
  UseAtomOptions,
  FieldAtom,
  RESET,
} from "form-atoms";
import { useState, useMemo } from "react";

const RemoveButton = ({ remove }: RemoveButtonProps) => (
  <button type="button" className="outline secondary" onClick={remove}>
    Remove
  </button>
);

const AddButton = ({ add }: AddButtonProps) => (
  <button type="button" className="outline" onClick={() => add()}>
    Add item
  </button>
);

const field = listField({
  name: "users",
  value: [],
  builder: ({ name, lastName, accounts = [] }) => ({
    name: textField({ value: name }),
    lastName: textField({ value: lastName }),
    accounts: listField({
      name: "accounts",
      value: accounts,
      builder: ({ iban }) => ({ iban: textField({ value: iban }) }),
    }),
  }),
});
const foo = textField({ name: "foo", value: "" });

export function useFormInitialValue<Value>(
  fieldAtom: FieldAtom<Value>,
  initialValue?: Value | typeof RESET,
  options?: UseAtomOptions
) {
  // useHydrateField(fieldAtom, initialValue, options);
  useFieldInitialValue(fieldAtom, initialValue, {
    ...options,
    areEqual: (a, b) => {
      const e = deepEqual(a, b);
      console.log("areEqual", a, b, e);
      return e;
    },
  });
}

export default function App() {
  const [data, setData] = useState({
    field: [
      {
        name: "Jerry",
        lastName: "Park",
        accounts: [{ iban: "SK89 7500 0000 0000 1234 5671" }],
      },
    ],
    foo: "hello",
  });

  const form = useMemo(() => formAtom({ field, foo }), []);
  const { reset, submit } = useFormActions(form);
  const { dirty } = useFormState(form);
  useFormInitialValue(field, data.field);

  useFormInitialValue(foo, data.foo);

  return (
    <form
      onSubmit={submit((values) => {
        console.log("submit", values);
        setData(values);
      })}
    >
      <div>
        <FieldLabel field={foo} label="Foo" />
        <InputField
          atom={foo}
          render={(props) => <input {...props} placeholder="Name" />}
        />
      </div>

      <List field={field}>
        {({ fields, index, remove }) => (
          <article>
            <header>
              <nav>
                <ul>
                  <li>
                    <strong>Person #{index + 1}</strong>
                  </li>
                </ul>
                <ul>
                  <li>
                    <a
                      href="#"
                      role="button"
                      className="outline secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        remove();
                      }}
                    >
                      Remove
                    </a>
                  </li>
                </ul>
              </nav>
            </header>
            <div className="grid">
              <div>
                <FieldLabel field={fields.name} label="First Name" />
                <InputField
                  atom={fields.name}
                  render={(props) => <input {...props} placeholder="Name" />}
                />
              </div>
              <div>
                <FieldLabel field={fields.lastName} label="Last Name" />
                <InputField
                  atom={fields.lastName}
                  render={(props) => (
                    <input {...props} placeholder="Last Name" />
                  )}
                />
              </div>
            </div>
            <List
              field={fields.accounts}
              AddButton={({ add }) => (
                <button type="button" className="outline" onClick={() => add()}>
                  Add Bank Account
                </button>
              )}
              RemoveButton={RemoveButton}
            >
              {({ fields, index, RemoveButton: RemoveIban }) => (
                <>
                  <label>Account #{index + 1}</label>
                  <div
                    style={{
                      display: "grid",
                      gridGap: 16,
                      gridTemplateColumns: "auto min-content",
                    }}
                  >
                    <InputField
                      atom={fields.iban}
                      render={(props) => (
                        <input {...props} placeholder="IBAN" />
                      )}
                    />
                    <RemoveIban />
                  </div>
                </>
              )}
            </List>
          </article>
        )}
      </List>

      <div className="grid">
        <div>dirty: {dirty ? "yes" : "no"}</div>
        <button>Submit</button>

        <button className="secondary" type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </form>
  );
}
