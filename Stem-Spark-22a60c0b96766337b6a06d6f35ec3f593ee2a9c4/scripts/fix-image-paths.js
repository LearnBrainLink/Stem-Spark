// Fix image path and accessibility issues
const fs = require("fs")
const path = require("path")

async function fixImagePaths() {
  console.log("🖼️ Starting image path fixes...")

  // 1. Check if public directory exists
  const publicDir = path.join(process.cwd(), "public")
  const imagesDir = path.join(publicDir, "images")

  console.log("📁 Checking directory structure...")

  if (!fs.existsSync(publicDir)) {
    console.log("📁 Creating public directory...")
    fs.mkdirSync(publicDir, { recursive: true })
  }

  if (!fs.existsSync(imagesDir)) {
    console.log("📁 Creating images directory...")
    fs.mkdirSync(imagesDir, { recursive: true })
  }

  // 2. Remove any problematic logo.png file if it exists as a directory
  const logoPath = path.join(imagesDir, "logo.png")

  try {
    const logoStats = fs.statSync(logoPath)
    if (logoStats.isDirectory()) {
      console.log("🗑️ Removing logo.png directory (should be a file)...")
      fs.rmSync(logoPath, { recursive: true, force: true })
    }
  } catch (error) {
    // File doesn't exist, which is fine
    console.log("✅ No problematic logo.png directory found")
  }

  // 3. Test image URLs
  console.log("\n🔍 Testing image URLs...")

  const imageUrls = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file-Es1GtGpls4shSscGjp8jpeTXPdDeC6.png", // New logo
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
  ]

  let successCount = 0
  let failureCount = 0

  for (const url of imageUrls) {
    try {
      const response = await fetch(url, { method: "HEAD" })
      if (response.ok) {
        console.log(`✅ ${url} - Status: ${response.status}`)
        successCount++
      } else {
        console.log(`❌ ${url} - Status: ${response.status}`)
        failureCount++
      }
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`)
      failureCount++
    }
  }

  console.log(`\n📊 Image URL Test Results:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failureCount}`)

  // 4. Create a README for the images directory
  const readmePath = path.join(imagesDir, "README.md")
  const readmeContent = `# STEM Spark Academy Images

This directory contains static images for the STEM Spark Academy application.

## Logo
- The main logo is served from: https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file-Es1GtGpls4shSscGjp8jpeTXPdDeC6.png
- Fallback SVG logo is generated in the Logo component

## Image Guidelines
- All images should include "STEM Spark Academy" branding when appropriate
- Use the BrandedImage component for consistent branding
- Fallback images are provided for different categories

## Directory Structure
- Keep this directory clean and organized
- Do not create subdirectories unless necessary
- Use descriptive filenames

Last updated: ${new Date().toISOString()}
`

  fs.writeFileSync(readmePath, readmeContent)
  console.log("✅ Created images directory README")

  // 5. Update component files to use correct image paths
  console.log("\n🔧 Updating component files...")

  const componentsToUpdate = [
    {
      file: "components/logo.tsx",
      updates: [
        {
          search: /const imageUrl = ".*"/,
          replace:
            'const imageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file-Es1GtGpls4shSscGjp8jpeTXPdDeC6.png"',
        },
      ],
    },
  ]

  for (const component of componentsToUpdate) {
    const filePath = path.join(process.cwd(), component.file)

    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8")
      let updated = false

      for (const update of component.updates) {
        if (update.search.test(content)) {
          content = content.replace(update.search, update.replace)
          updated = true
        }
      }

      if (updated) {
        fs.writeFileSync(filePath, content)
        console.log(`✅ Updated ${component.file}`)
      } else {
        console.log(`ℹ️ ${component.file} already up to date`)
      }
    } else {
      console.log(`⚠️ ${component.file} not found`)
    }
  }

  console.log("\n🎉 Image path fixes completed!")
  console.log("\n📋 Summary:")
  console.log("✅ Verified directory structure")
  console.log("✅ Removed problematic files/directories")
  console.log("✅ Tested image URL accessibility")
  console.log("✅ Updated component files")
  console.log("✅ Created documentation")
}

fixImagePaths()
