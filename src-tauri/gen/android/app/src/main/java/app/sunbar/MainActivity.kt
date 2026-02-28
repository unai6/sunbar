package app.sunbar

import android.os.Build
import android.os.Bundle
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    // Android defaults to RENDERER_PRIORITY_BOUND, allowing the OS to starve
    // the WebView renderer process under memory pressure. For ArcGIS SceneView
    // this causes the I3S tile LOD system to constantly evict and re-request
    // 3D geometry — the low-quality flash loop. RENDERER_PRIORITY_IMPORTANT
    // tells Android to treat this renderer like a foreground Chrome tab.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      webView.setRendererPriorityPolicy(
        WebView.RENDERER_PRIORITY_IMPORTANT,
        false // don't waive priority when not visible — keeps GPU context alive
      )
    }
  }
}
