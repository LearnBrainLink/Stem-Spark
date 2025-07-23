export default function TestLayoutPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Layout Test</h1>
      <p className="text-gray-600">
        If you can see this page with the admin sidebar, the layout is working correctly.
      </p>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold text-blue-900">Layout Status:</h2>
        <ul className="mt-2 text-blue-800">
          <li>✓ Admin sidebar should be visible on the left</li>
          <li>✓ Content should be positioned to the right of the sidebar</li>
          <li>✓ Navigation items should be clickable</li>
        </ul>
      </div>
    </div>
  )
} 