import { useId, useState } from 'react';
import useAction from '../hooks/useAction';
import { ActionFeedback } from './Feedback';

export default function EntityForm({
  title,
  fields,
  initial = {},
  onSave,
  onCancel,
  submitLabel = 'Guardar',
  reset = true,
}) {
  const prefix = useId();
  const defaults = () =>
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        initial[field.name] ?? field.defaultValue ?? '',
      ]),
    );
  const [values, setValues] = useState(defaults);
  const action = useAction();
  async function submit(event) {
    event.preventDefault();
    const body = Object.fromEntries(
      fields.map((field) => {
        const raw = values[field.name];
        return [
          field.name,
          field.type === 'number'
            ? Number(raw)
            : field.nullable && raw === ''
              ? null
              : typeof raw === 'string' && field.type !== 'password'
                ? raw.trim()
                : raw,
        ];
      }),
    );
    const result = await action.run(() => onSave(body));
    if (result.ok && reset) setValues(defaults());
  }
  return (
    <form
      className="activity-form entity-form"
      aria-label={title}
      onSubmit={submit}
    >
      <h2>{title}</h2>
      <ActionFeedback action={action} />
      <fieldset disabled={action.busy}>
        <div className="entity-fields">
          {fields.map((field) => (
            <div
              className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`}
              key={field.name}
            >
              <label htmlFor={`${prefix}-${field.name}`}>
                {field.label}
                {field.required ? ' *' : ''}
              </label>
              {field.options ? (
                <select
                  id={`${prefix}-${field.name}`}
                  name={field.name}
                  value={values[field.name]}
                  required={field.required}
                  onChange={(e) =>
                    setValues({ ...values, [field.name]: e.target.value })
                  }
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`${prefix}-${field.name}`}
                  name={field.name}
                  rows={4}
                  maxLength={field.maxLength || 4000}
                  required={field.required}
                  value={values[field.name]}
                  onChange={(e) =>
                    setValues({ ...values, [field.name]: e.target.value })
                  }
                />
              ) : (
                <input
                  id={`${prefix}-${field.name}`}
                  name={field.name}
                  type={field.type || 'text'}
                  value={values[field.name]}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                  step={field.step ?? (field.type === 'number' ? 1 : undefined)}
                  minLength={field.minLength}
                  maxLength={field.maxLength ?? 150}
                  autoComplete={field.autoComplete}
                  onChange={(e) =>
                    setValues({ ...values, [field.name]: e.target.value })
                  }
                />
              )}
              {field.hint && <small>{field.hint}</small>}
            </div>
          ))}
        </div>
        <div className="activity-buttons">
          <button className="primary-button" type="submit">
            {action.busy ? 'Guardando…' : submitLabel}
          </button>
          {onCancel && (
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}
