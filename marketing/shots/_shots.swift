// Abre PARFECT en vivo en un WKWebView, siembra datos demo, navega y guarda PNGs reales.
import Cocoa
import WebKit

setbuf(stdout, nil)
let BASE = "http://localhost:4173/"
let OUT  = FileManager.default.currentDirectoryPath + "/shots"
try? FileManager.default.createDirectory(atPath: OUT, withIntermediateDirectories: true)

let steps: [(String, String, Double)] = [
  ("01-inicio",     "document.querySelector(\"[data-view='inicio']\").click();", 1.3),
  ("02-social",     "document.querySelector(\"[data-view='perfil']\").click();", 1.6),
  ("03-diagnostico","document.querySelector(\"[data-view='trainer']\").click(); setTimeout(function(){var r=[...document.querySelectorAll('button')].find(x=>/^\\s*Resumen\\s*$/.test(x.textContent||'')); if(r)r.click(); setTimeout(function(){var g=[...document.querySelectorAll('button')].find(x=>/Generar diagn/i.test(x.textContent||'')); if(g)g.click();},450);},350);", 3.0),
  ("04-objetivos",  "var b=[...document.querySelectorAll('button')].find(x=>/Objetivos/.test(x.textContent||'')); if(b)b.click();", 1.6),
  ("05-ronda",      "document.querySelector(\"[data-view='inicio']\").click(); setTimeout(function(){var c=[...document.querySelectorAll('button,[role=button],.round-card,[data-id]')].find(x=>/\\b1\\d\\d\\b|Tres Marías|Campestre/.test(x.textContent||'') && (x.textContent||'').length<60); if(c)c.click();},400);", 2.0),
]

let app = NSApplication.shared
app.setActivationPolicy(.regular)

let W = 440, H = 956
let web = WKWebView(frame: NSRect(x: 0, y: 0, width: W, height: H), configuration: WKWebViewConfiguration())
let win = NSWindow(contentRect: NSRect(x: 120, y: 120, width: W, height: H),
                   styleMask: [.titled], backing: .buffered, defer: false)
win.title = "PARFECT"
win.contentView = web
win.makeKeyAndOrderFront(nil)
app.activate(ignoringOtherApps: true)

// timeout de seguridad
DispatchQueue.main.asyncAfter(deadline: .now() + 35) { print("TIMEOUT"); exit(2) }

final class Nav: NSObject, WKNavigationDelegate {
  var cb: (() -> Void)?
  func webView(_ w: WKWebView, didFinish n: WKNavigation!) { cb?() }
  func webView(_ w: WKWebView, didFail n: WKNavigation!, withError e: Error) { print("navFail \(e)") }
  func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { print("provFail \(e)") }
}
let nav = Nav()
web.navigationDelegate = nav

func snap(_ name: String, _ done: @escaping () -> Void) {
  let sc = WKSnapshotConfiguration()
  sc.afterScreenUpdates = true
  sc.snapshotWidth = NSNumber(value: 1080)
  web.takeSnapshot(with: sc) { image, err in
    if let img = image, let tiff = img.tiffRepresentation,
       let rep = NSBitmapImageRep(data: tiff),
       let png = rep.representation(using: .png, properties: [:]) {
      try? png.write(to: URL(fileURLWithPath: "\(OUT)/\(name).png"))
      print("saved \(name)  \(rep.pixelsWide)x\(rep.pixelsHigh)")
    } else { print("FAIL \(name): \(String(describing: err))") }
    done()
  }
}

func runStep(_ i: Int) {
  if i >= steps.count { print("done"); DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { exit(0) }; return }
  let (name, js, wait) = steps[i]
  web.evaluateJavaScript(js) { _, _ in
    DispatchQueue.main.asyncAfter(deadline: .now() + wait) { snap(name) { runStep(i + 1) } }
  }
}

var seeded = false
nav.cb = {
  if !seeded {
    seeded = true
    print("seeding...")
    web.evaluateJavaScript("try{seedDemoAccount();}catch(e){}; location.reload();") { _, _ in }
  } else {
    print("booted, capturing...")
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { runStep(0) }
  }
}
web.load(URLRequest(url: URL(string: BASE)!))
app.run()
