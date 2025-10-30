import { useState } from 'react'
import React from 'react'

const HomePage = () => {
  const [formData, setFormData] = React.useState({
      rawtext: "",
      platform:[]
    })
  return (
    <>
    <h3>Enter Raw Text</h3>
    <form action="">
        <textarea name="rawtext" rows={20} cols={100} value={formData.rawtext} id=""></textarea>
        <br />
        <h3>Platforms</h3>
        <div>
            <input type="checkbox" name="platform" id="Linkedin" value={'Linkedin'} onChange={(e) => {
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
                        }} />
         
          <span>Linkedin</span>
        </div>

        <div>
          <input type="checkbox" name="platform" id="instagram" value={'instagram'} onChange={(e)=>{
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
          }}/>
          <span>Instagram</span>
        </div>

        <div>
          <input type="checkbox" name="platform" id="twitter" value={'twitter'} onChange={(e)=>{
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
          }}/>
          <span>Twitter</span>
        </div>

        <button type='button' onClick={()=>{console.log('Form Data: ',formData)}}>Print Form Data</button>

      </form>    

    </>
  )
}

export default HomePage