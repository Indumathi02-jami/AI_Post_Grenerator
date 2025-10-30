import React, { useState } from 'react'
import './HomePage.css'

const HomePage = () => {
  const [formData, setFormData] = useState({
      rawtext: "",
      platforms: []
    })

    // Helper to extract the generated text/content from the Gemini API response.
    // Instead of returning the first found fragment (which can cause truncated
    // appearance when the API returns multiple parts/candidates), collect all
    // text fragments and join them with sensible separators.
    const extractGeneratedText = (obj) => {
      if (!obj) return ''

      const collected = []

      const collect = (x) => {
        if (!x && x !== 0) return
        if (typeof x === 'string') {
          if (x.trim()) collected.push(x.trim())
          return
        }
        if (Array.isArray(x)) {
          for (const it of x) collect(it)
          return
        }
        if (typeof x === 'object') {
          // Common direct text locations
          if (typeof x.text === 'string' && x.text.trim()) collected.push(x.text.trim())
          if (typeof x.output === 'string' && x.output.trim()) collected.push(x.output.trim())
          // Recurse into likely containers
          if (Array.isArray(x.contents)) collect(x.contents)
          if (Array.isArray(x.parts)) collect(x.parts)
          if (Array.isArray(x.candidates)) collect(x.candidates)
          // Also traverse other keys
          for (const k of Object.keys(x)) {
            if (['text','parts','contents','candidates','output'].includes(k)) continue
            collect(x[k])
          }
        }
      }

      collect(obj)

      // Deduplicate adjacent identical items and join with double newline to
      // better preserve separate posts for different platforms.
      const deduped = []
      for (const s of collected) {
        if (!s) continue
        if (deduped.length === 0 || deduped[deduped.length-1] !== s) deduped.push(s)
      }

      return deduped.join('\n\n')
    }

  const [geminiResponse, setGeminiResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

    // Map platform names to emojis for nicer UI
    const platformEmoji = (name) => {
      if (!name) return '✨'
      const n = name.toLowerCase()
      if (n.includes('link')) return '💼'
      if (n.includes('insta')) return '📸'
      if (n.includes('twitter') || n.includes('x')) return '🐦'
      if (n.includes('tiktok')) return '🎵'
      return '✨'
    }

    // Try to split the returned content into platform-specific cards.
    // It first attempts to match explicit "platform Name...post..." blocks;
    // if that fails, it falls back to slicing by selected platform names.
    const parseResponseToCards = (content) => {
      if (!content) return []
      const cards = []
      const re = /platform\s*Name\s*[:\-\s]*([^,\n]+)[,\n\s]*post\s*[:\-\s]*([\s\S]*?)(?=(?:\n{2,})|$)/gmi
      let m
      while ((m = re.exec(content)) !== null) {
        cards.push({ platform: m[1].trim(), post: m[2].trim() })
      }
      if (cards.length) return cards

      // Fallback: slice by selected platform names (order of selection)
      if (Array.isArray(formData.platforms) && formData.platforms.length) {
        const low = content.toLowerCase()
        formData.platforms.forEach((p) => {
          const name = p.toLowerCase()
          const start = low.indexOf(name)
          if (start >= 0) {
            // find earliest next platform occurrence after this start
            let end = content.length
            formData.platforms.forEach((q) => {
              const qn = q.toLowerCase()
              if (qn === name) return
              const idx = low.indexOf(qn, start + 1)
              if (idx > 0 && idx < end) end = idx
            })
            const snippet = content.substring(start, end).replace(new RegExp(p, 'ig'), '').trim()
            cards.push({ platform: p, post: snippet })
          }
        })
        if (cards.length) return cards
      }

      // Final fallback: one card with whole content
      return [{ platform: 'Post', post: content.trim() }]
    }

    const contactGemini = () => {
      // Call the Gemini API with the formData
      try{
        setCopied(false)
        setLoading(true)
        const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("X-goog-api-key", "AIzaSyDz1r2myUj36fBwJd_tZSxLx1UvSOFIfNs");

const raw = JSON.stringify({
  contents: [
    {
      parts: [
        {
          text: `i want you to generate social media posts based on the raw text: ${formData.rawtext}for the following platforms: ${formData.platforms.join(', ')}. 
          Make sure the posts are engaging and suitable for each platform.make sure tone of the post align with the platform.
          output structure:platform Name : [platformName],post: [PostContent]`
        }
      ]
    }
  ]
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", requestOptions)
  .then((response) => response.json())
  .then((data) => {
    const content = extractGeneratedText(data)
    // Log only the extracted generated content to the console
    console.log(content)
    setGeminiResponse(content)
    setLoading(false)
  })
  .catch((error) => { console.error(error); setLoading(false)});
      } 
      catch(error){
        console.error("Error contacting Gemini API: ", error);
        setLoading(false)
      }
    }
  return (
    <div className="homepage">
      <div className="card">
        <h1 className="title">✨ Social Media Post Generator ✨</h1>
        <h3 className="label">Enter Raw Text</h3>
        <form className="post-form" action="">
          <textarea className="rawtext" name="rawtext" rows={12} cols={80} value={formData.rawtext} onChange={(e) => setFormData({...formData, rawtext: e.target.value})} />
        <br />
          <h3 className="label">Platforms</h3>
          <div className="platform-list">
            <label className="platform-item"><input type="checkbox" name="platform" id="Linkedin" value={'Linkedin'} onChange={(e) => {
                            if (e.target.checked) {
                                setFormData({
                                    ...formData,
                                    platforms: [...formData.platforms, e.target.value]
                                })
                            } else if (e.target.checked === false) {
                                setFormData({
                                    ...formData,
                                    platforms: formData.platforms.filter((platform) => platform !== e.target.value)
                                })
                            }
                        }} /> 💼 Linkedin</label>

            <label className="platform-item"><input type="checkbox" name="platform" id="instagram" value={'Instagram'} onChange={(e)=>{
            if (e.target.checked) {
                                setFormData({
                                    ...formData,
                                    platforms: [...formData.platforms, e.target.value]
                                })
                            } else if (e.target.checked === false) {
                                setFormData({
                                    ...formData,
                                    platforms: formData.platforms.filter((platform) => platform !== e.target.value)
                                })
                            }
          }}/>&nbsp;Instagram</label>

            <label className="platform-item"><input type="checkbox" name="platform" id="twitter" value={'Twitter'} onChange={(e)=>{
            if (e.target.checked) {
              setFormData({
                ...formData,
                platforms: [...formData.platforms, e.target.value]
                })
            } else if (e.target.checked === false) {
                                setFormData({
                                    ...formData,
                                    platforms: formData.platforms.filter((platform) => platform !== e.target.value)
                                })
                            }
          }}/>&nbsp;Twitter</label>
          </div>

          <div className="actions">
            <button type='button' className="btn primary" onClick={contactGemini} disabled={loading || !formData.rawtext.trim() || formData.platforms.length===0}>
              {loading ? (
                <> <span className="spinner" aria-hidden></span> Generating...</>
              ) : (
                'Generate Posts'
              )}
            </button>
          </div>
        </form>

        {geminiResponse && (
          <div className="response-block">
            <h2 className="response-title">Gemini Response</h2>
            <div className="response-actions">
              <button className="btn secondary" onClick={() => { navigator.clipboard.writeText(geminiResponse); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>
                📋 Copy Response
              </button>
              {copied && <span className="copied-badge">Copied!</span>}
            </div>
            <div className="response-cards">
              {parseResponseToCards(geminiResponse).map((c, idx) => (
                <div className="response-card" key={idx}>
                  <div className="response-card-header"><span className="emoji">{platformEmoji(c.platform)}</span>
                    <strong style={{marginLeft:8}}>{c.platform}</strong>
                  </div>
                  <div className="response-card-body">{c.post}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage