import CustomButton from '../components/CustomButton'

export const Default = () => (
  <div className="p-4 flex gap-4">
    <CustomButton color="primary">
      <button>Native Button</button>
    </CustomButton>

    <CustomButton variant="secondary">
      <a href="https://google.com" onClick={(e) => e.preventDefault()}>Anchor Link</a>
    </CustomButton>

    <CustomButton variant="outline">
      <button>Outline</button>
    </CustomButton>

    <CustomButton variant="danger">
      <button>Outline</button>
    </CustomButton>
  </div>
)

export const WithCustomElement = () => (
  <div className="p-4">
    <CustomButton size="lg" className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white border-0">
      <div role="button" tabIndex={0} className="font-bold flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        div as Button
      </div>
    </CustomButton>
  </div>
)
