import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service"
}

export default function TermsOfService() {
  return <>

    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Terms of Service</h1>
      <p className="mb-4">
        Welcome to our website! By accessing or using this website, you acknowledge that you have read and understood the following terms and conditions ("Terms of Service"). If you do not agree with these Terms of Service, please do not use our website.
      </p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Definitions</h2>
      <p className="mb-6">
        For the purpose of these Terms of Service, the following definitions shall apply:
        <ul className="list-disc list-inside ml-6 mt-1">
          <li><strong>Provider:</strong> refers to the individual or entity that has registered and/or been authorized by ServiHub to provide services.</li>
          <li><strong>User:</strong> refers to any natural person, legal entity, or other organization that accesses or uses this website, either individually or collectively with others.</li>
        </ul>
      </p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Acceptance of Terms</h2>
      <p className="mb-6">
        By accessing or using this website, you agree to be bound by these Terms of Service. If you do not accept these Terms of Service, please do not use our website.
      </p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Services</h2>
      <p className="mb-6">
        ServiHub provides various services through this website, including but not limited to:
        <ul className="list-disc list-inside ml-6 mt-1">
          <li>Online booking and scheduling of services</li>
          <li>Customer support and service inquiries</li>
          <li>Product listings and sales</li>
        </ul>
      </p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">User Obligations</h2>
      <p className="mb-6">
        Users are responsible for:
        <ul className="list-disc list-inside ml-6 mt-1">
          <li>Providing accurate and complete personal information when registering on our website</li>
          <li>Using this website in accordance with these Terms of Service and applicable laws</li>
          <li>Maintaining the confidentiality of their login credentials and not sharing them with others</li>
        </ul>
      </p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Provider Obligations</h2>
      <p className="mb-6">
        Providers are responsible for:
        <ul className="list-disc list-inside ml-6 mt-1">
          <li>Providing accurate and complete information about their services and qualifications</li>
          <li>Maintaining the accuracy and completeness of their profiles on our website</li>
          <li>Respecting the rights of other users and complying with applicable laws</li>
        </ul>
      </p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Termination</h2>
      <p className="mb-6">
        ServiHub may terminate or suspend access to this website at any time, without notice, if:
        <ul className="list-disc list-inside ml-6 mt-1">
          <li>User violates these Terms of Service</li>
          <li>Provider fails to comply with applicable laws</li>
          <li>ServiHub is required to do so by law or court order</li>
        </ul>
      </p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Limitation of Liability</h2>
      <p className="mb-6">
        ServiHub will not be liable for any indirect, incidental, special, or consequential damages arising from the use or misuse of this website, including but not limited to lost profits, loss of data, or damage to computer systems.
      </p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Governing Law</h2>
      <p className="mb-6">
        These Terms of Service are governed by and shall be construed in accordance with the laws of [Insert Location], without regard to its conflict of law provisions.
      </p>
    </div>

  </>
}
