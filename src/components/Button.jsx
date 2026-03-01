import React from 'react'

export default function Button({ variant = 'primary', children, onClick, ...rest }) {
  const className = variant === 'secondary' ? 'sec-btn' : (variant === 'amber' ? 'amber-cta' : 'cta-btn')
  return (
    <button className={className} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
