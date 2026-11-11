import { profile } from "@/content/profile";
import { CopyButton } from "./copy-button";
import { Signature } from "./signature";

export function Contact() {
  const { contact } = profile;
  return (
    <footer className="foot" id="lien-he">
      <div className="wrap">
        <p className="tag">Liên hệ</p>
        <h2>
          Nói chuyện <em>với mình</em>
        </h2>
        <div className="foot-grid">
          <ul className="contact">
            <li>
              <span className="k">Email</span>
              <span className="v" id="contact-email">
                {contact.email}
              </span>
              <CopyButton value={contact.email} event="copy-email" targetId="contact-email" />
            </li>
            <li>
              <span className="k">Nơi ở</span>
              <span className="v">{profile.location}</span>
              <span />
            </li>
          </ul>
          <Signature />
        </div>
      </div>
    </footer>
  );
}
