/** Accessible inline error banner replacing blocking alert() dialogs. */
const FormError = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: '#fce8e6',
        border: '1px solid #f28b82',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span style={{
        fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
        fontSize: '14px',
        color: '#c5221f',
      }}>
        {message}
      </span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            border: 'none',
            background: 'transparent',
            color: '#c5221f',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default FormError;
