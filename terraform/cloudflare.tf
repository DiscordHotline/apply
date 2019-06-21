resource "cloudflare_record" "apply" {
    domain  = "hotline.gg"
    name    = "apply"
    type    = "CNAME"
    value   = "alias.zeit.co"
    proxied = true
}
resource "cloudflare_record" "www" {
    domain  = "hotline.gg"
    name    = "www"
    type    = "CNAME"
    value   = "alias.zeit.co"
    proxied = true
}
resource "cloudflare_record" "root" {
    domain  = "hotline.gg"
    name    = "@"
    type    = "CNAME"
    value   = "alias.zeit.co"
    proxied = true
}


resource "cloudflare_page_rule" "acme" {
    target = "http://*.hotline.gg/.well-known/acme-challenge/*"
    zone   = "hotline.gg"
    actions {
        disable_security = true
        disable_performance = true
        ssl = "off"
    }
}
