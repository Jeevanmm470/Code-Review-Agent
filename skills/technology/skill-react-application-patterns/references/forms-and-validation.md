# Forms & Validation Integration Reference

This guide details best practices, common defects, and remediation strategies for React form management, controlled vs. uncontrolled state transitions, and form library bindings (`RAP03`, `RAP04`).

---

## 1. Controlled vs. Uncontrolled Input State Transitions (`RAP03`)

### 1.1 The `undefined` to Defined Transition Trap

In React, an `<input>` is considered **uncontrolled** if its `value` prop is `undefined`, and **controlled** if its `value` prop is a `string` (or number). Passing `undefined` on the initial render and later supplying a string when data loads will cause React to emit a runtime warning and desynchronize internal DOM state.

#### Anti-Pattern: Value Initialized to `undefined`
```tsx
// ❌ Bug: user.bio is undefined before fetch completes, switching uncontrolled -> controlled
function EditProfile({ user }: { user?: { name: string; bio?: string } }) {
  const [bio, setBio] = useState(user?.bio); // bio is undefined initially!

  useEffect(() => {
    if (user?.bio) {
      setBio(user.bio); // Switches to controlled string
    }
  }, [user]);

  return (
    <textarea
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      placeholder="Tell us about yourself"
    />
  );
}
```

#### Correct Pattern: Guaranteed Fallback Values
```tsx
// ✅ Correct: Controlled value is guaranteed to be a string at all times
function EditProfile({ user }: { user?: { name: string; bio?: string } }) {
  const [bio, setBio] = useState(user?.bio ?? '');

  useEffect(() => {
    if (user?.bio !== undefined) {
      setBio(user.bio);
    }
  }, [user?.bio]);

  return (
    <textarea
      value={bio ?? ''} // Always defined
      onChange={(e) => setBio(e.target.value)}
      placeholder="Tell us about yourself"
    />
  );
}
```

---

## 2. Form Library Binding & Validation Lifecycle (`RAP04`)

### 2.1 React Hook Form: Direct `<input>` vs. Custom Component `<Controller />`

When using React Hook Form with standard HTML inputs, `register` works seamlessly. However, when using complex UI components (e.g., custom Select pickers, DatePickers, Slider), wrapping them in `<Controller />` is mandatory to keep value synchronization and touch/dirty flags intact.

#### Anti-Pattern: Bypassing Controller for Custom Component
```tsx
// ❌ Flawed: Passing register directly to custom component expecting value/onChange
import { useForm } from 'react-hook-form';
import { CustomDateSelector } from './CustomDateSelector';

export function BookingForm() {
  const { register, handleSubmit } = useForm<{ bookingDate: Date }>();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {/* CustomDateSelector doesn't forward native input props; values are lost! */}
      <CustomDateSelector {...register('bookingDate')} />
      <button type="submit">Book</button>
    </form>
  );
}
```

#### Correct Pattern: Explicit `<Controller />` Integration
```tsx
// ✅ Correct: Controller bridges custom event signatures to React Hook Form
import { useForm, Controller } from 'react-hook-form';
import { CustomDateSelector } from './CustomDateSelector';

interface FormValues {
  bookingDate: Date | null;
}

export function BookingForm() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { bookingDate: null }
  });

  const onSubmit = async (values: FormValues) => {
    await submitBooking(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="bookingDate"
        control={control}
        rules={{ required: 'Please select a booking date' }}
        render={({ field, fieldState }) => (
          <div>
            <CustomDateSelector
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            {fieldState.error && (
              <span role="alert" className="error-text">
                {fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Booking...' : 'Book'}
      </button>
    </form>
  );
}
```

### 2.2 Form Submission State & Preventing Duplicate Submissions

Form submit handlers that execute asynchronous network calls must guard against concurrent submissions and provide user feedback.

```tsx
// ❌ Flawed: Submit button remains active during slow API call, allowing double clicks
function CheckoutForm() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    // Missing guard against already processing!
    setIsProcessing(true);
    try {
      await processPayment();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <button type="submit">Pay Now</button>
    </form>
  );
}

// ✅ Correct: Guard with isProcessing and disable submit button
function CheckoutForm() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent duplicate triggers

    setIsProcessing(true);
    try {
      await processPayment();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <button type="submit" disabled={isProcessing} aria-busy={isProcessing}>
        {isProcessing ? 'Processing Transaction...' : 'Pay Now'}
      </button>
    </form>
  );
}
```

