import '../assets/WriteView.css'
import { useState, useRef, useEffect, JSX } from 'react'
import { api } from '../services'
import { useModal } from './ModalContext'
import { useUser } from './UserContext'

export function WriteView({ onBack }: { onBack: () => void }): JSX.Element {
  const [text, setText] = useState<string>('')
  const [category, setCategory] = useState<'goal' | 'event' | 'note'>('goal')
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-CA'))
  const [time, setTime] = useState<string>('')
  const [hasDate, setHasDate] = useState<boolean>(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const todayStr = new Date().toLocaleDateString('en-CA')

  const { showModal } = useModal()
  const { t } = useUser() // 👈

  useEffect((): void => {
    textareaRef.current?.focus()
  }, [])

  const handleSend = async (): Promise<void> => {
    if (!text.trim()) return
    const finalText = time ? `[${time}] ${text}` : text

    try {
      await api.postCalendar({
        text: finalText,
        category,
        date: hasDate ? date : todayStr,
        moment: 'morning'
      })
      showModal({
        title: t.write.savedTitle,
        message: t.write.savedMsg,
        type: 'alert',
        onConfirm: () => {
          setText('')
          onBack()
        }
      })
    } catch (err) {
      console.error(err)
      showModal({ title: t.write.errorTitle, message: t.write.errorMsg, type: 'alert' })
    }
  }

  return (
    <div className="write-container">
      <div className="soft-ui write-grid">
        <div className="category-selector">
          <button
            className={`soft-btn ${category === 'goal' ? 'active' : ''}`}
            onClick={() => {
              setCategory('goal')
              setHasDate(true)
            }}
          >
            {t.write.tabGoal}
          </button>
          <button
            className={`soft-btn ${category === 'event' ? 'active' : ''}`}
            onClick={() => {
              setCategory('event')
              setHasDate(true)
            }}
          >
            {t.write.tabEvent}
          </button>
          <button
            className={`soft-btn ${category === 'note' ? 'active' : ''}`}
            onClick={() => {
              setCategory('note')
              setHasDate(false)
            }}
          >
            {t.write.tabThought}
          </button>
        </div>

        {hasDate && (
          <div className="date-group">
            <div className="date">
              <label className="date-label">{t.write.lblDate}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="soft-input"
              />
            </div>
            <div className="hour">
              <label className="date-label">{t.write.lblTime}</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="soft-input"
              />
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="soft-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.write.placeholder}
        />

        <div className="write-actions">
          <button onClick={onBack} className="soft-btn">
            {t.write.btnCancel}
          </button>
          <button onClick={handleSend} className="soft-btn-primary">
            {t.write.btnSave}
          </button>
        </div>
      </div>
    </div>
  )
}
