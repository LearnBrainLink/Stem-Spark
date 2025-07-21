// Script to verify all images are loading correctly
const imageUrls = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file-YjeaBm51JXPy1MlJEvsrGjiJ7g9Ci4.png", // Logo
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092335397-9fa341108e1e?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
]

async function checkImage(url) {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return {
      url,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    }
  } catch (error) {
    return {
      url,
      status: "ERROR",
      ok: false,
      error: error.message,
    }
  }
}

async function verifyAllImages() {
  console.log("🔍 Verifying image accessibility...\n")

  const results = await Promise.all(imageUrls.map(checkImage))

  let successCount = 0
  let failureCount = 0

  results.forEach((result) => {
    if (result.ok) {
      console.log(`✅ ${result.url} - Status: ${result.status} - Type: ${result.contentType}`)
      successCount++
    } else {
      console.log(`❌ ${result.url} - Status: ${result.status} - Error: ${result.error || "Failed to load"}`)
      failureCount++
    }
  })

  console.log(`\n📊 Summary:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failureCount}`)
  console.log(`📈 Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`)

  if (failureCount === 0) {
    console.log("\n🎉 All images are loading correctly!")
  } else {
    console.log("\n⚠️  Some images failed to load. Check the URLs and try again.")
  }
}

verifyAllImages()
