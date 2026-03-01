import React from 'react'
import Button from '../components/Button.jsx'

export default {
  title: 'Components/Button',
  component: Button,
}

export const Primary = () => <Button>Primary</Button>
export const Secondary = () => <Button variant="secondary">Secondary</Button>
export const Amber = () => <Button variant="amber">Amber</Button>
