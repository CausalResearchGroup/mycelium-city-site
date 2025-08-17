import React from 'react';
import netlifyIdentity from 'netlify-identity-widget';

export default function LoginForm() {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h2>Please log in</h2>
      <button onClick={() => netlifyIdentity.open()} style={{ padding: '10px 20px', fontSize: '1rem' }}>
        Login
      </button>
    </div>
  );
}
