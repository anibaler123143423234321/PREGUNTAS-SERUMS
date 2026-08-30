import React from 'react';

/**
 * 1. ECG Heartbeat Pulse Animated SVG (Línea de Ritmo Cardíaco Médico)
 */
export function EcgHeartbeatLoader({ size = 32, color = 'var(--primary)' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        d="M2 12h4l2.5-6 4 12 3-8 2 4.5 1.5-2.5h3"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="40"
        strokeDashoffset="40"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="40;0;40"
          dur="1.8s"
          repeatCount="indefinite"
          ease="easeInOut"
        />
      </path>
    </svg>
  );
}

/**
 * 2. Neural AI Pulsing Nodes SVG (Groq LPU / Red Neuronal)
 */
export function NeuralAiLoader({ size = 28, color = 'var(--primary)' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Conexiones */}
      <line x1="12" y1="12" x2="4" y2="6" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="12" y1="12" x2="20" y2="6" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="12" y1="12" x2="4" y2="18" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="12" y1="12" x2="20" y2="18" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
      
      {/* Nodo Central */}
      <circle cx="12" cy="12" r="3.5" fill={color}>
        <animate attributeName="r" values="3;4.5;3" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />
      </circle>

      {/* Nodos Periféricos */}
      <circle cx="4" cy="6" r="2.5" fill="#38bdf8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="20" cy="6" r="2.5" fill="#818cf8">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="4" cy="18" r="2.5" fill="#a78bfa">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="20" cy="18" r="2.5" fill="#34d399">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/**
 * 3. Modern Pulse Radar Spinner SVG (Elegante y Ultra-Ligero)
 */
export function PulseRadarLoader({ size = 26, color = 'var(--primary)' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

/**
 * 4. Cloud Data Waves SVG (Para Sincronización Supabase Cloud)
 */
export function CloudSyncAnimated({ size = 24, color = '#10b981' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        d="M6.5 19a4.5 4.5 0 0 1-.42-8.98A6 6 0 0 1 17.6 7.5 5 5 0 0 1 20 17H6.5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 12v5m0-5l-2 2m2-2l2 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-2; 0,0"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

/**
 * 5. Animated Success Checkmark SVG
 */
export function SuccessCheckAnimated({ size = 20, color = '#10b981' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="rgba(16, 185, 129, 0.15)" />
      <path
        d="M7 12.5l3.5 3.5 7-7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="20"
        strokeDashoffset="0"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="20"
          to="0"
          dur="0.4s"
          fill="freeze"
        />
      </path>
    </svg>
  );
}
