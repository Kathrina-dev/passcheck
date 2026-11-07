
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "input",
    "toggle",
    "label",
    "meter",
    "length",
    "lowercase",
    "uppercase",
    "number",
    "symbol",
    "result",
    "message"
  ]

  check() {
    const password = this.inputTarget.value

    const checks = {
      length: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password)
    }

    Object.entries(checks).forEach(([name, passed]) => {
      const target = this[`${name}Target`]

      target.classList.toggle("valid", passed)
      target.querySelector(".requirement-icon").textContent =
        passed ? "✓" : "○"
    })

    const score = Object.values(checks).filter(Boolean).length

    const levels = [
      "Weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
      "Strong"
    ]

    const level = levels[score]

    this.labelTarget.textContent = level

    this.meterTarget.className =
      `strength-meter ${level.toLowerCase()}`

    this.resultTarget.hidden = password.length === 0

    if (password.length > 0) {
      const baseMessage = this.getMessage(score, password.length)

      this.messageTarget.textContent = baseMessage

      clearTimeout(this.wordlistTimeout)

      this.wordlistTimeout = setTimeout(() => {
        this.checkWordlist(password, baseMessage)
      }, 350)
    }
  }

  getMessage(score, length) {
    if (length < 12) {
      return "Your password is too short. Try using at least 12 characters."
    }

    if (score <= 2) {
      return "Your password needs more variety. Consider adding different character types."
    }

    if (score <= 4) {
      return "Your password is getting better. Consider improving the missing requirements."
    }

    return "Your password meets all five basic checks. This does not yet verify whether it appears in known compromised-password lists."
  }

  async checkWordlist(password, baseMessage) {
    try {
      const response = await fetch("/password_check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector(
            'meta[name="csrf-token"]'
          ).content
        },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        throw new Error("Password check failed")
      }

      const data = await response.json()

      // Ignore outdated responses if the user has typed something else.
      if (this.inputTarget.value !== password) return

      if (data.compromised) {
        this.messageTarget.textContent =
          "⚠️ This password appears in one of our known password lists. Do not use it."
      } else {
        this.messageTarget.textContent =
          `${baseMessage} It was not found in our two password lists.`
      }
    } catch (error) {
      console.error("Password check error:", error)

      if (this.inputTarget.value === password) {
        this.messageTarget.textContent =
          `${baseMessage} We couldn't check the password lists.`
      }
    }
  }

  toggleVisibility() {
    const isHidden = this.inputTarget.type === "password"

    this.inputTarget.type = isHidden ? "text" : "password"
    this.toggleTarget.textContent = isHidden ? "Hide" : "Show"
    this.toggleTarget.setAttribute(
      "aria-label",
      isHidden ? "Hide password" : "Show password"
    )
  }

  clear() {
    this.inputTarget.value = ""
    this.inputTarget.type = "password"
    this.toggleTarget.textContent = "Show"
    this.toggleTarget.setAttribute("aria-label", "Show password")

    this.check()
    this.labelTarget.textContent = "Waiting for input"
    this.meterTarget.className = "strength-meter"
  }
}
